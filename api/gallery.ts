
import { v2 as cloudinary } from 'cloudinary';

export default async function handler(req: any, res: any) {
    // Config
    cloudinary.config({
        cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
        api_key: process.env['CLOUDINARY_API_KEY'],
        api_secret: process.env['CLOUDINARY_API_SECRET'],
        secure: true
    });

    try {
        // Fetch assets from folder 'tattoos'
        // Reference: https://cloudinary.com/documentation/admin_api#get_resources
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'tattoos/', // Folder name
            max_results: 100,
            context: true, // To get metadata (alt, caption, custom fields if mapped)
            tags: true,
            direction: 'desc',
            sort_by: 'created_at'
        });

        const resources = result.resources.map((resource: any) => ({
            publicId: resource.public_id,
            url: resource.secure_url,
            createdAt: resource.created_at,
            tags: resource.tags || [],
            // Context/Metadata fallback
            title: resource.context?.custom?.caption || resource.context?.caption || '',
            description: resource.context?.custom?.alt || resource.context?.alt || '',
            category: resource.context?.custom?.category || (resource.tags && resource.tags.length > 0 ? resource.tags[0] : 'Uncategorized')
        }));

        res.status(200).json(resources);
    } catch (error: any) {
        console.error('Cloudinary API Error:', error);
        res.status(500).json({ error: 'Failed to fetch gallery', details: error.message });
    }
}
