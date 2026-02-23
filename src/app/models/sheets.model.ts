export interface SheetContent {
    hero_tagline: string;
    about_title: string;
    about_text: string;
    cta_text: string;
}

export interface GalleryItem {
    id: number | string; // Changed to allow string ID from Cloudinary
    title: string;
    category: string;
    description: string;
    imageUrl: string;
    fullUrl: string;
    createdAt: string;
    tags?: string[]; // Added tags
}

export interface CloudinaryItem {
    publicId: string;
    url: string;
    fullUrl: string;
    createdAt: string;
    tags: string[];
    title: string;
    description: string;
}



export interface ContactInfo {
    studio_name: string;
    city: string;
    address: string;
    email: string;
    phone: string;
    open_hours: string;
    [key: string]: string; // Allow dynamic keys for flexibility
}

export interface SiteData {
    content: SheetContent;
    contact: ContactInfo;
}

export interface GoogleSheetResponse {
    values: string[][];
    valueRanges?: { values: string[][] }[]; // For batchGet response
}
