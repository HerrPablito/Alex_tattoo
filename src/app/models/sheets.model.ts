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
    [key: string]: string;
}

export interface SiteData {
    contact: ContactInfo;
    translations: Record<string, Record<string, string>>;
}

export interface GoogleSheetResponse {
    values: string[][];
    valueRanges?: { values: string[][] }[]; // For batchGet response
}
