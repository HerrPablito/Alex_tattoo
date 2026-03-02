import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { map, take } from 'rxjs/operators';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { SeoService } from '../../services/seo.service';
import { FormatTextPipe } from '../../pipes/format-text.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe, ButtonModule, ChipModule, ProgressSpinnerModule, FormatTextPipe],
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
