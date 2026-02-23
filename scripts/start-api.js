
const express = require('express');
const { v2: cloudinary } = require('cloudinary');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();
const PORT = 4000;

// In-memory cache
let galleryCache = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

app.get('/api/gallery', async (req, res) => {
    // Serve from cache if fresh
    if (galleryCache && Date.now() - cacheTime < CACHE_TTL) {
        res.set('Cache-Control', 'public, max-age=3600');
        return res.json(galleryCache);
    }

    // Config
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });

    console.log(`\n--- Request received at /api/gallery ---`);
    console.log(`Target Prefix: '${process.env.CLOUDINARY_FOLDER || 'tattoos/'}'`);

    try {
        // Attempt 1: Fetch from specific folder
        const initialResult = await cloudinary.api.resources({
            type: 'upload',
            prefix: process.env.CLOUDINARY_FOLDER || 'tattoos/',
            max_results: 100,
            context: true,
            tags: true,
            direction: 'desc',
            sort_by: 'created_at'
        });

        let resources = initialResult.resources;
        console.log(`Found ${resources.length} items in target folder.`);

        if (resources.length === 0) {
            console.log('⚠️  Target folder is empty. Falling back to ROOT (prefix: "") ...');

            // Fallback: Fetch from root
            const rootResult = await cloudinary.api.resources({
                type: 'upload',
                prefix: '',
                max_results: 100,
                context: true,
                tags: true,
                direction: 'desc',
                sort_by: 'created_at'
            });

            console.log(`Found ${rootResult.resources.length} items in ROOT.`);
            resources = rootResult.resources;
        }

        const mappedResources = resources.map((resource) => ({
            publicId: resource.public_id,
            url: cloudinary.url(resource.public_id, {
                secure: true,
                fetch_format: 'auto',
                quality: 'auto',
                width: 800,
                crop: 'limit'
            }),
            fullUrl: cloudinary.url(resource.public_id, {
                secure: true,
                fetch_format: 'auto',
                quality: 'auto',
                width: 1400,
                crop: 'limit'
            }),
            createdAt: resource.created_at,
            tags: resource.tags || [],
            title: resource.context?.custom?.caption || resource.context?.caption || '',
            description: resource.context?.custom?.alt || resource.context?.alt || '',
            category: resource.context?.custom?.category || (resource.tags && resource.tags.length > 0 ? resource.tags[0] : 'Uncategorized')
        }));

        // Store in cache
        galleryCache = mappedResources;
        cacheTime = Date.now();

        res.set('Cache-Control', 'public, max-age=3600');
        res.json(mappedResources);
    } catch (error) {
        console.error('Cloudinary API Error:', error);
        res.status(500).json({ error: 'Failed to fetch gallery', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`API Debug Server running at http://localhost:${PORT}`);
});
