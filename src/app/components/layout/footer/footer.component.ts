import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GoogleSheetsService } from '../../../services/google-sheets.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe],
  template: `
    <footer class="bg-brand-dark border-t border-brand-gray/20 text-brand-white py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12" *ngIf="contactInfo$ | async as contact">
          
          <!-- Brand -->
          <div class="flex flex-col gap-4">
            <h3 class="text-2xl font-serif font-bold text-white tracking-widest">ALEX TATTOO</h3>
            <p class="text-brand-white/70 max-w-xs leading-relaxed">
              {{ contact['hero_tagline'] || 'Dark art. Clean lines. Timeless ink.' }}
            </p>
            <div class="flex gap-4 mt-2">
              <a href="https://www.instagram.com/axst_tattoos?igsh=MTZkb2d0OW82dDN3cQ==" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center hover:bg-brand-gold hover:text-black transition-all">
                <i class="pi pi-instagram"></i>
              </a>
            </div>
          </div>

          <!-- Studio Info -->
          <div class="flex flex-col gap-4">
            <h4 class="text-lg font-bold text-brand-gold uppercase tracking-wider">Hitta hit</h4>
            <div class="flex flex-col gap-2 text-brand-white/80">
              <p>{{ contact.studio_name }}</p>
              <p>{{ contact.address }}</p>
              <p>{{ contact.city }}</p>
              <a [href]="'mailto:' + contact.email" class="hover:text-brand-gold transition-colors mt-2 block">{{ contact.email }}</a>
              <a [href]="'tel:' + contact.phone" class="hover:text-brand-gold transition-colors block">{{ contact.phone }}</a>
            </div>
          </div>

          <!-- Opening Hours -->
          <div class="flex flex-col gap-4">
             <h4 class="text-lg font-bold text-brand-gold uppercase tracking-wider">Öppettider</h4>
             <p class="text-brand-white/80">{{ contact.open_hours }}</p>
             <p class="text-brand-white/50 text-sm italic mt-4">Endast tidsbokning.</p>
             
             <div class="mt-4">
                <a routerLink="/contact" class="inline-block border border-brand-gold text-brand-gold px-6 py-2 rounded-full hover:bg-brand-gold hover:text-black transition-all uppercase text-sm tracking-wide font-bold">
                    Boka Tid
                </a>
             </div>
          </div>

        </div>
      </div>
      
      <!-- Copyright -->
      <div class="border-t border-brand-gray/10 mt-12 pt-8 text-center text-brand-white/30 text-xs flex flex-col items-center gap-2">
        <p>&copy; {{ currentYear }} Alex Tattoo. Alla rättigheter förbehållna.</p>
        <a routerLink="/gdpr" class="hover:text-brand-gold transition-colors underline underline-offset-4 text-[10px] uppercase tracking-widest text-brand-white/50">Integritetspolicy (GDPR)</a>
      </div>
    </footer>
  `
})
export class FooterComponent {
  private sheetService = inject(GoogleSheetsService);
  contactInfo$ = this.sheetService.getContact();
  currentYear = new Date().getFullYear();
}
