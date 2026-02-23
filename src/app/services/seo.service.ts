import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { ContactInfo } from '../models/sheets.model';

export interface SeoConfig {
    title: string;
    description: string;
    url?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
    private titleService = inject(Title);
    private meta = inject(Meta);
    private document = inject(DOCUMENT);

    update(config: SeoConfig): void {
        this.titleService.setTitle(config.title);

        this.meta.updateTag({ name: 'description', content: config.description });

        // Open Graph
        this.meta.updateTag({ property: 'og:title', content: config.title });
        this.meta.updateTag({ property: 'og:description', content: config.description });
        this.meta.updateTag({ property: 'og:type', content: 'website' });
        this.meta.updateTag({ property: 'og:locale', content: 'sv_SE' });

        if (config.url) {
            this.meta.updateTag({ property: 'og:url', content: config.url });
        }

        // Twitter Card
        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:title', content: config.title });
        this.meta.updateTag({ name: 'twitter:description', content: config.description });
    }

    injectLocalBusiness(contact: ContactInfo): void {
        const existing = this.document.getElementById('schema-local-business');
        if (existing) existing.remove();

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'TattooShop',
            name: contact.studio_name || 'Alex Tattoo',
            description: 'Professionell tatuerare specialiserad på blackwork och fineline.',
            telephone: contact.phone,
            email: contact.email,
            address: {
                '@type': 'PostalAddress',
                streetAddress: contact.address,
                addressLocality: contact.city,
                addressCountry: 'SE'
            },
            openingHoursSpecification: [
                {
                    '@type': 'OpeningHoursSpecification',
                    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    opens: '10:00',
                    closes: '18:00'
                }
            ],
            priceRange: '$$'
        };

        const script = this.document.createElement('script');
        script.id = 'schema-local-business';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        this.document.head.appendChild(script);
    }
}
