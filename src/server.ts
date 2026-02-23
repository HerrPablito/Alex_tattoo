import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

import { v2 as cloudinary } from 'cloudinary';

// In-memory cache for gallery
let galleryCache: any[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Cloudinary Gallery API
 */
app.get('/api/gallery', async (req, res) => {
  // Serve from cache if fresh
  if (galleryCache && Date.now() - cacheTime < CACHE_TTL) {
    res.set('Cache-Control', 'public, max-age=3600');
    res.json(galleryCache);
    return;
  }

  cloudinary.config({
    cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
    api_key: process.env['CLOUDINARY_API_KEY'],
    api_secret: process.env['CLOUDINARY_API_SECRET'],
    secure: true
  });

  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: process.env['CLOUDINARY_FOLDER'] || 'tattoos/',
      max_results: 100,
      context: true,
      tags: true,
      direction: 'desc',
      sort_by: 'created_at'
    });

    const resources = result.resources.map((resource: any) => ({
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
    galleryCache = resources;
    cacheTime = Date.now();

    res.set('Cache-Control', 'public, max-age=3600');
    res.status(200).json(resources);
  } catch (error: any) {
    console.error('Cloudinary API Error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery', details: error.message });
  }
});

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html'
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
