
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { map, shareReplay, catchError, retry, timeout, tap } from 'rxjs/operators';
import { CloudinaryItem, GalleryItem } from '../models/sheets.model';

@Injectable({
    providedIn: 'root'
})
export class CloudinaryService {
    private http = inject(HttpClient);

    loading = signal(false);
    error = signal<string | null>(null);

    // Cache the gallery response
    private gallery$: Observable<GalleryItem[]> | null = null;

    getGallery(): Observable<GalleryItem[]> {
        if (!this.gallery$) {
            this.loading.set(true);
            this.error.set(null);
            this.gallery$ = this.http.get<{ items: CloudinaryItem[] }>('/api/gallery').pipe(
                timeout(8_000),
                retry({ count: 2, delay: (_, n) => timer(n * 1_000) }),
                map(({ items }) => items.map(item => ({
                    publicId: item.publicId,
                    id: item.publicId,
                    title: item.title || 'Untitled',
                    description: item.description || '',
                    category: item.tags?.[0] || 'Portfolio',
                    imageUrl: this.toThumbnail(item.url),
                    fullUrl: item.url,
                    createdAt: item.createdAt,
                    tags: item.tags
                }))),
                tap(() => this.loading.set(false)),
                catchError(err => {
                    console.error('Error fetching gallery from Cloudinary proxy', err);
                    this.loading.set(false);
                    this.error.set('Kunde inte ladda galleriet. Kontrollera att API:t körs och försök igen.');
                    this.gallery$ = null;
                    return of([] as GalleryItem[]);
                }),
                shareReplay(1)
            );
        }
        return this.gallery$!;
    }

    private toThumbnail(url: string): string {
        // Infogar Cloudinary-transformationer: 600px bred, auto-format (WebP/AVIF), auto-kvalitet
        return url.replace('/upload/', '/upload/w_600,c_fill,f_auto,q_auto/');
    }

    refresh(): void {
        this.gallery$ = null;
        this.error.set(null);
    }
}
