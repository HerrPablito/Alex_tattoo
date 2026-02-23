import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonModule, DrawerModule, RippleModule],
  template: `
    <header class="fixed top-0 left-0 w-full z-50 bg-brand-black/90 backdrop-blur-md border-b border-brand-gray/20">
      <div class="container mx-auto px-4 h-20 flex items-center justify-between">
        <!-- Logo -->
        <a routerLink="/" class="text-2xl font-serif font-bold tracking-widest text-white hover:text-brand-gold transition-colors">
          ALEX TATTOO
        </a>

        <!-- Desktop Menu -->
        <nav class="hidden md:flex items-center gap-8">
          <a routerLink="/" routerLinkActive="text-brand-gold" [routerLinkActiveOptions]="{exact: true}" class="text-sm font-medium tracking-wide hover:text-brand-gold transition-colors">HOME</a>
          <a routerLink="/gallery" routerLinkActive="text-brand-gold" class="text-sm font-medium tracking-wide hover:text-brand-gold transition-colors">BILDER</a>
          <a routerLink="/contact" routerLinkActive="text-brand-gold" class="text-sm font-medium tracking-wide hover:text-brand-gold transition-colors">KONTAKT</a>
          <a href="https://instagram.com" target="_blank" pButton icon="pi pi-instagram" class="p-button-text p-button-rounded text-white hover:text-brand-gold"></a>
        </nav>

        <!-- Mobile Menu Button -->
        <button (click)="visible = true" class="md:hidden text-white hover:text-brand-gold focus:outline-none">
          <i class="pi pi-bars text-2xl"></i>
        </button>
      </div>
    </header>

    <!-- Mobile Sidebar -->
    <p-drawer [(visible)]="visible" position="right" styleClass="!bg-brand-black !border-l !border-brand-gray/30 w-64">
      <div class="flex flex-col h-full p-6">
        <div class="mb-8 flex justify-between items-center">
             <span class="text-xl font-serif font-bold text-white">MENU</span>
        </div>
        
        <nav class="flex flex-col gap-6">
          <a (click)="visible = false" routerLink="/" routerLinkActive="text-brand-gold" [routerLinkActiveOptions]="{exact: true}" class="text-lg font-medium text-white hover:text-brand-gold transition-colors">HOME</a>
          <a (click)="visible = false" routerLink="/gallery" routerLinkActive="text-brand-gold" class="text-lg font-medium text-white hover:text-brand-gold transition-colors">BILDER</a>
          <a (click)="visible = false" routerLink="/contact" routerLinkActive="text-brand-gold" class="text-lg font-medium text-white hover:text-brand-gold transition-colors">KONTAKT</a>
        </nav>

        <div class="mt-auto flex gap-4 pt-8 border-t border-brand-gray/20">
            <a href="https://instagram.com" target="_blank" class="text-white hover:text-brand-gold text-xl"><i class="pi pi-instagram"></i></a>
            <a href="#" target="_blank" class="text-white hover:text-brand-gold text-xl"><i class="pi pi-facebook"></i></a>
            <a href="#" target="_blank" class="text-white hover:text-brand-gold text-xl"><i class="pi pi-tiktok"></i></a>
        </div>
      </div>
    </p-drawer>
  `,
  styles: [`
    :host ::ng-deep .p-drawer {
        background: #0a0a0a;
        color: #f5f5f5;
    }
  `]
})
export class HeaderComponent {
  visible = false;
}
