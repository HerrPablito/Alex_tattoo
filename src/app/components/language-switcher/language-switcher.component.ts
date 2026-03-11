import { Component, inject } from '@angular/core';
import { TranslationService, Lang } from '../../services/translation.service';

@Component({
    selector: 'app-language-switcher',
    standalone: true,
    template: `
        <div class="flex items-center gap-1 text-sm font-bold tracking-wider">
            <button (click)="set('sv')"
                [class]="lang() === 'sv'
                    ? 'flex items-center gap-1 text-brand-gold'
                    : 'flex items-center gap-1 text-white/40 hover:text-white transition-colors'">
                <span>🇸🇪</span> SV
            </button>
            <span class="text-white/20">/</span>
            <button (click)="set('en')"
                [class]="lang() === 'en'
                    ? 'flex items-center gap-1 text-brand-gold'
                    : 'flex items-center gap-1 text-white/40 hover:text-white transition-colors'">
                <span>🇬🇧</span> EN
            </button>
        </div>
    `
})
export class LanguageSwitcherComponent {
    private translationService = inject(TranslationService);
    lang = this.translationService.lang;

    set(lang: Lang): void {
        this.translationService.setLang(lang);
    }
}
