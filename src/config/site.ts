export const siteConfig = {
    contact: {
        phone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
        email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
        address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS,
        mapLink: process.env.NEXT_PUBLIC_CONTACT_MAP_LINK,
    },
    socials: {
        facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
        instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
        tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK,
        grubhub: 'https://www.grubhub.com/restaurant/4-seasons-restaurant-322-s-main-st-wharton/4483792',
    }
};
