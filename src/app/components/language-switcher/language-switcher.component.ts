import { Component, inject } from '@angular/core';
import { TranslationService, Lang } from '../../services/translation.service';

@Component({
    selector: 'app-language-switcher',
    standalone: true,
    template: `
        <div class="flex items-center gap-1 text-sm font-bold tracking-wider">
            <button (click)="set('sv')"
                [class]="lang() === 'sv'
                    ? 'text-brand-gold'
                    : 'text-white/40 hover:text-white transition-colors'">
                SV
            </button>
            <span class="text-white/20">/</span>
            <button (click)="set('en')"
                [class]="lang() === 'en'
                    ? 'text-brand-gold'
                    : 'text-white/40 hover:text-white transition-colors'">
                EN
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
