import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const WP_API_URL = 'https://4seasonswharton.com/wp-json/wp/v2';
const RSS_URL = 'https://4seasonswharton.com/feed/?post_type=themo_event';

const DATA_DIR = path.join(__dirname, '../src/data');

interface WP_Page {
    id: number;
    date: string;
    slug: string;
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
}

interface WP_Event {
    id: string;
    title: string;
    link: string;
    date: string;
    content: string | any;
    excerpt: string;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchPages() {
    console.log('Fetching Pages from WordPress REST API...');
    try {
        const res = await fetch(`${WP_API_URL}/pages?_embed&per_page=100`);
        if (!res.ok) {
            throw new Error(`Failed to fetch pages: ${res.statusText}`);
        }
        const pages: WP_Page[] = await res.json();

        // Transform into a dictionary by slug for easier lookup
        const pagesMap: Record<string, any> = {};
        for (const page of pages) {
            let parsedContent: any = null;

            if (page.slug.endsWith('-menu')) {
                parsedContent = { type: 'menu', sections: [] };
                const $ = cheerio.load(page.content.rendered);
                let currentSection: any = null;

                $('h2, p').each((_, el) => {
                    const $el = $(el);
                    if ($el.is('h2')) {
                        if (currentSection) parsedContent.sections.push(currentSection);
                        currentSection = { heading: $el.text().trim(), items: [] };
                    } else if ($el.is('p') && currentSection) {
                        const htmlContent = $el.html() || '';
                        const lines = htmlContent.split(/<br\s*\/?>/i);
                        for (const line of lines) {
                            const cleanLine = cheerio.load(line).text().trim();
                            if (cleanLine && cleanLine !== '') {
                                // Extract description from parenthesis if present
                                let desc = '';
                                let mainText = cleanLine;
                                const descMatch = cleanLine.match(/\((.*?)\)/);
                                if (descMatch) {
                                    desc = descMatch[1].trim();
                                    mainText = cleanLine.replace(/\s*\(.*?\)\s*/, '').trim();
                                }

                                // Try to split by em-dash or hyphen for Name and Price
                                const parts = mainText.split(/\s[–-]\s/);
                                if (parts.length > 1) {
                                    const price = parts.pop()?.trim();
                                    const nameDesc = parts.join(' - ').trim();
                                    currentSection.items.push({ text: cleanLine, name: nameDesc, price: price, description: desc });
                                } else {
                                    currentSection.items.push({ text: mainText, description: desc });
                                }
                            }
                        }
                    }
                });
                if (currentSection) parsedContent.sections.push(currentSection);

            } else if (['home-gallery', 'dining-ambiance', 'featured-items'].includes(page.slug)) {
                parsedContent = { type: 'gallery', images: [] };
                const $ = cheerio.load(page.content.rendered);
                $('img').each((_, el) => {
                    const $img = $(el);
                    parsedContent.images.push({
                        url: $img.attr('src')?.replace(/-\d+x\d+(\.[a-zA-Z]+)$/, '$1'),
                        alt: $img.attr('alt') || '',
                        width: parseInt($img.attr('width') || '800', 10),
                        height: parseInt($img.attr('height') || '600', 10),
                        srcSet: $img.attr('srcset'),
                        sizes: $img.attr('sizes')
                    });
                });
            } else {
                // Not a menu or gallery, we still want to strip HTML for pure content
                const $ = cheerio.load(page.content.rendered);
                parsedContent = { type: 'text', text: $.text().trim(), rawHtml: page.content.rendered };
            }

            pagesMap[page.slug] = {
                id: page.id,
                date: page.date,
                slug: page.slug,
                title: page.title,
                content: {
                    rendered: parsedContent // Replacing the raw HTML with our clean JSON object
                },
                excerpt: {
                    rendered: cheerio.load(page.excerpt.rendered).text().trim()
                }
            };
        }

        const pagesPath = path.join(DATA_DIR, 'pages.json');
        fs.writeFileSync(pagesPath, JSON.stringify(pagesMap, null, 2));
        console.log(`✅ Saved ${pages.length} pages to ${pagesPath}`);
    } catch (error) {
        console.error('❌ Error fetching pages:', error);
    }
}

async function fetchEvents() {
    console.log('Fetching Events from WordPress RSS Feed...');
    try {
        const res = await fetch(RSS_URL);
        if (!res.ok) {
            throw new Error(`Failed to fetch events RSS: ${res.statusText}`);
        }
        const xmlText = await res.text();
        const events: WP_Event[] = [];

        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xmlText)) !== null) {
            const itemContent = match[1];

            const extract = (tag: string) => {
                const regex = new RegExp(`<${tag}.*?>([\\s\\S]*?)<\\/${tag}>`);
                const result = regex.exec(itemContent);
                if (!result) return '';
                let text = result[1];
                text = text.replace(/^<!\[CDATA\[(.*)\]\]>$/, '$1');
                return text.trim();
            };

            const title = extract('title');
            const link = extract('link');
            const pubDate = extract('pubDate');
            const contentEncoded = extract('content:encoded');
            const description = extract('description');

            const cleanContent = contentEncoded || description;
            const cleanExcerpt = cheerio.load(description).text().substring(0, 150) + '...';

            const cleanContentText = cheerio.load(cleanContent).text().trim();
            const images: string[] = [];
            const $ = cheerio.load(cleanContent);
            $('img').each((_, el) => {
                const src = $(el).attr('src');
                if (src) images.push(src);
            });

            events.push({
                id: link,
                title,
                link,
                date: new Date(pubDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                content: { text: cleanContentText, images },
                excerpt: cleanExcerpt
            });
        }

        const eventsPath = path.join(DATA_DIR, 'events.json');
        fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
        console.log(`✅ Saved ${events.length} events to ${eventsPath}`);
    } catch (error) {
        console.error('❌ Error fetching events:', error);
    }
}

async function fetchPosts() {
    console.log('Fetching Posts from WordPress REST API...');
    try {
        const res = await fetch(`${WP_API_URL}/posts?_embed&per_page=100`);
        if (!res.ok) {
            throw new Error(`Failed to fetch posts: ${res.statusText}`);
        }
        const posts = await res.json();
        const cleanedPosts = posts.map((post: any) => ({
            ...post,
            content: { rendered: cheerio.load(post.content.rendered).text().trim() },
            excerpt: { rendered: cheerio.load(post.excerpt.rendered).text().trim() }
        }));

        const postsPath = path.join(DATA_DIR, 'posts.json');
        fs.writeFileSync(postsPath, JSON.stringify(cleanedPosts, null, 2));
        console.log(`✅ Saved ${posts.length} posts to ${postsPath}`);
    } catch (error) {
        console.error('❌ Error fetching posts:', error);
    }
}

async function main() {
    await fetchPages();
    await fetchEvents();
    await fetchPosts();
    console.log('🎉 Data extraction complete!');
}

main();
