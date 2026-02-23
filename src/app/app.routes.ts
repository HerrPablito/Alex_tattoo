import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { ContactComponent } from './pages/contact/contact.component';
import { GdprComponent } from './pages/gdpr/gdpr.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'galleri', component: GalleryComponent },
    { path: 'kontakt', component: ContactComponent },
    { path: 'gdpr', component: GdprComponent },
    // Redirects för gamla engelska URL:er
    { path: 'gallery', redirectTo: 'galleri', pathMatch: 'full' },
    { path: 'contact', redirectTo: 'kontakt', pathMatch: 'full' },
    { path: '**', redirectTo: '' }
];
