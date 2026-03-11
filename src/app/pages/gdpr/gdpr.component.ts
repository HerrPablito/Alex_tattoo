import { Component, inject } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-gdpr',
  imports: [],
  templateUrl: './gdpr.component.html',
  styleUrl: './gdpr.component.scss'
})
export class GdprComponent {
  private translation = inject(TranslationService);
  t = (key: string) => this.translation.t(key);
}
