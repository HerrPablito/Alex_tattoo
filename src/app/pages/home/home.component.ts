import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { map, take } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { SeoService } from '../../services/seo.service';
import { FormatTextPipe } from '../../pipes/format-text.pipe';
import { GalleryItem } from '../../models/sheets.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe, ButtonModule, ChipModule, ProgressSpinnerModule, FormatTextPipe, DialogModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private sheetService = inject(GoogleSheetsService);
  private cloudinaryService = inject(CloudinaryService);
  private seo = inject(SeoService);

  loading = this.sheetService.loading;
  error = this.sheetService.error;
  content$ = this.sheetService.getContent();

  featuredGallery$ = this.cloudinaryService.getGallery().pipe(
    map(items => items.slice(0, 6))
  );

  featuredItems = toSignal(this.featuredGallery$, { initialValue: [] as GalleryItem[] });

  lightboxVisible = signal(false);
  lightboxIndex = signal(0);

  get lightboxItem(): GalleryItem | null {
    const items = this.featuredItems() ?? [];
    return items[this.lightboxIndex()] ?? null;
  }

  openLightbox(index: number): void {
    this.lightboxIndex.set(index);
    this.lightboxVisible.set(true);
  }

  prev(): void {
    const items = this.featuredItems() ?? [];
    this.lightboxIndex.update(i => (i - 1 + items.length) % items.length);
  }

  next(): void {
    const items = this.featuredItems() ?? [];
    this.lightboxIndex.update(i => (i + 1) % items.length);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (!this.lightboxVisible()) return;
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'Escape') this.lightboxVisible.set(false);
  }

  ngOnInit(): void {
    this.seo.update({
      title: 'Alex Tattoo – Tatuerare i Göteborg | Blackwork & Fineline',
      description: 'Professionell tatuerare i Göteborg specialiserad på blackwork och fineline. Boka din konsultation idag.'
    });

    this.sheetService.getContact().pipe(take(1)).subscribe(contact => {
      this.seo.injectLocalBusiness(contact);
    });
  }
}
