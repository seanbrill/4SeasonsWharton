import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';

const DATA_DIR = path.join(__dirname, '../src/data');
const PUBLIC_DIR = path.join(__dirname, '../public');
const LIVE_DOMAIN = 'https://4seasonswharton.com';
const STAGING_DOMAIN = 'https://05f.997.myftpupload.com';

async function downloadImage(urlStr: string) {
    // urlStr is like https://4seasonswharton.com/wp-content/uploads/2026/01/drink-2.png
    const parsedUrl = new URL(urlStr);
    const pathname = parsedUrl.pathname; // /wp-content/uploads/2026/01/drink-2.png

    // Construct local path
    const localPath = path.join(PUBLIC_DIR, pathname);

    // Create directories if they don't exist
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Skip downloading if it already exists
    if (fs.existsSync(localPath)) {
        console.log(`Skipping (already exists): ${pathname}`);
        return;
    }

    // Rewrite domain to staging domain to bypass DNS blocking
    const fetchUrl = `${STAGING_DOMAIN}${pathname}`;

    console.log(`Downloading: ${fetchUrl}`);
    try {
        const res = await fetch(fetchUrl);
        if (!res.ok) {
            console.error(`Failed to download ${fetchUrl}: ${res.statusText}`);
            return;
        }

        // Write file safely
        if (res.body) {
            // @ts-ignore
            await pipeline(res.body, fs.createWriteStream(localPath));
        } else {
            console.error(`Empty body for ${fetchUrl}`);
        }
    } catch (e) {
        console.error(`Fetch error for ${fetchUrl}:`, e);
    }
}

async function processJsonFile(fileName: string) {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf-8');

    // Find all image URLs pointing to wp-content/uploads
    // Using a regex to catch all instances
    const urlRegex = /https:\/\/4seasonswharton\.com\/wp-content\/uploads\/[a-zA-Z0-9_\-\/\.]+/g;

    const matches = content.match(urlRegex) || [];
    const uniqueUrls = [...new Set(matches)];

    if (uniqueUrls.length > 0) {
        console.log(`Found ${uniqueUrls.length} unique images in ${fileName}`);

        let counter = 1;
        for (const url of uniqueUrls) {
            console.log(`[${counter}/${uniqueUrls.length}] Processing...`);
            await downloadImage(url);
            counter++;
        }

        // Now replace all absolute URLs with local relative paths inside the JSON
        console.log(`Rewriting JSON paths in ${fileName}...`);
        // e.g. "https://4seasonswharton.com/wp-content/uploads/" -> "/wp-content/uploads/"
        uniqueUrls.forEach(url => {
            const parsedUrl = new URL(url);
            const pathname = parsedUrl.pathname;
            content = content.split(url).join(pathname);
        });

        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Updated ${fileName} with local paths.`);
    } else {
        console.log(`No images found in ${fileName}.`);
    }
}

async function main() {
    console.log('Starting image extraction and download process...');
    await processJsonFile('pages.json');
    await processJsonFile('events.json');
    await processJsonFile('posts.json');
    console.log('🎉 All images downloaded and JSON references updated!');
}

main();
