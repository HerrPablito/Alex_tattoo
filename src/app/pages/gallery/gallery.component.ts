import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { TranslationService } from '../../services/translation.service';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { GalleryItem } from '../../models/sheets.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ChipModule,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './gallery.component.html',
  styles: [`
    :host ::ng-deep .p-dropdown {
        background: #1e1e1e;
        border-color: #333;
        color: #f5f5f5;
    }
    :host ::ng-deep .p-dropdown-panel {
        background: #1e1e1e;
        border-color: #333;
    }
    :host ::ng-deep .p-dropdown-item {
        color: #f5f5f5;
    }
    :host ::ng-deep .p-dropdown-item:hover {
        background: #333;
    }
    :host ::ng-deep .p-inputtext {
        background: #1e1e1e;
        border-color: #333;
        color: #f5f5f5;
    }
    :host ::ng-deep .p-chip {
        background: #333;
        color: #fff;
    }
    :host ::ng-deep .p-dialog .p-dialog-header,
    :host ::ng-deep .p-dialog .p-dialog-content {
        background: #121212;
        color: #fff;
    }
  `]
})
export class GalleryComponent implements OnInit {
  private cloudinaryService = inject(CloudinaryService);
  private seo = inject(SeoService);
  private router = inject(Router);
  private translation = inject(TranslationService);

  t = (key: string) => this.translation.t(key);

  ngOnInit(): void {
    this.seo.update({
      title: 'Galleri – Tatueringar i Göteborg | Alex Tattoo',
      description: 'Se utvalda tatueringar inom blackwork, fineline och custom i Göteborg. Boka din tatuering idag.',
      url: 'https://axst.se/galleri'
    });
  }

  // Service state
  error = this.cloudinaryService.error;
  loading = this.cloudinaryService.loading;

  // Data Signals
  galleryItems = toSignal(this.cloudinaryService.getGallery(), { initialValue: [] });

  // Filter Signals
  searchQuery = signal('');
  activeTags = signal<string[]>([]);
  selectedSort = signal<string>('newest');

  // UI State
  selectedImage = signal<GalleryItem | null>(null);
  dialogVisible = signal(false);

  sortOptions = computed(() => [
    { label: this.t('gallery_sort_newest'), value: 'newest' },
    { label: this.t('gallery_sort_oldest'), value: 'oldest' },
    { label: this.t('gallery_sort_az'), value: 'az' }
  ]);

  // Computed: Extract unique tags from all items
  allTags = computed(() => {
    const items = this.galleryItems();
    const tags = new Set<string>();
    items.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  });

  // Computed Filtered Items
  filteredItems = computed(() => {
    let items = [...this.galleryItems()];
    const query = this.searchQuery().toLowerCase();
    const activeTags = this.activeTags();
    const sort = this.selectedSort();

    // Filter by Search
    if (query) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by Tags (OR logic)
    if (activeTags.length > 0) {
      items = items.filter(item =>
        (item.tags || []).some(tag => activeTags.includes(tag))
      );
    }

    // Sort
    items.sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'az') return a.title.localeCompare(b.title);
      return 0;
    });

    return items;
  });

  toggleTag(tag: string) {
    this.activeTags.update(tags => {
      if (tags.includes(tag)) {
        return tags.filter(t => t !== tag);
      } else {
        return [...tags, tag];
      }
    });
  }

  isTagActive(tag: string): boolean {
    return this.activeTags().includes(tag);
  }

  openLightbox(item: GalleryItem) {
    this.selectedImage.set(item);
    this.dialogVisible.set(true);
  }

  bookSimilar(item: GalleryItem) {
    this.dialogVisible.set(false);
    this.router.navigate(['/kontakt'], { queryParams: { ref: item.fullUrl } });
  }
}
