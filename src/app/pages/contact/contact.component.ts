import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { SeoService } from '../../services/seo.service';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';

const ACCEPTED_MIME = new Set([
  'image/jpeg', 'image/gif', 'image/png', 'image/heic', 'image/heif', 'application/pdf'
]);
const MAX_FILES = 3;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    ReactiveFormsModule,
    InputTextModule,
    InputTextarea,
    ButtonModule,
    FloatLabel,
    RadioButtonModule,
    CheckboxModule
  ],
  templateUrl: './contact.component.html',
  styles: []
})
export class ContactComponent implements OnInit {
  private sheetService = inject(GoogleSheetsService);
  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Boka tatuering i Göteborg – Kontakt | Alex Tattoo',
      description: 'Boka en tatueringskonsultation i Göteborg eller skicka en förfrågan. Svarar inom 24 timmar.'
    });

    const refUrl = this.route.snapshot.queryParamMap.get('ref');
    if (refUrl) {
      fetch(refUrl)
        .then(r => r.blob())
        .then(blob => {
          const filename = refUrl.split('/').pop()?.split('?')[0] || 'referens.jpg';
          const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
          this.inspirationFiles = [file];
        })
        .catch(() => {});
    }
  }
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  contactInfo$ = this.sheetService.getContact();

  contactForm = this.fb.group({
    name:             ['', Validators.required],
    email:            ['', [Validators.required, Validators.email]],
    phone:            ['', Validators.required],
    placement:        ['', Validators.required],
    size:             ['', Validators.required],
    description:      ['', [Validators.required, Validators.minLength(10)]],
    consultation:     ['', Validators.required],
    consultationTime: [''],
    age18:            [false, Validators.requiredTrue],
    gdpr:             [false, Validators.requiredTrue]
  });

  inspirationFiles: File[] = [];
  fileError: string | null = null;
  isSubmitting = false;

  get showTimeOptions(): boolean {
    return this.contactForm.get('consultation')?.value === 'specific';
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const incoming = Array.from(input.files);
    this.fileError = null;

    for (const file of incoming) {
      const ext = file.name.toLowerCase();
      const isHeic = ext.endsWith('.heic') || ext.endsWith('.heif');
      if (!ACCEPTED_MIME.has(file.type) && !isHeic) {
        this.fileError = `"${file.name}" är ett format som inte stöds. Tillåtna format: jpg, gif, png, heic, pdf.`;
        input.value = '';
        return;
      }
    }

    const combined = [...this.inspirationFiles, ...incoming];
    if (combined.length > MAX_FILES) {
      this.fileError = `Max ${MAX_FILES} filer tillåtna.`;
      input.value = '';
      return;
    }

    this.inspirationFiles = combined;
    input.value = '';
  }

  removeFile(index: number): void {
    this.inspirationFiles = this.inspirationFiles.filter((_, i) => i !== index);
    this.fileError = null;
  }

  getFileIcon(file: File): string {
    return file.type === 'application/pdf' ? 'pi pi-file-pdf' : 'pi pi-image';
  }

  formatFileSize(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  onSubmit(): void {
    const timeCtrl = this.contactForm.get('consultationTime');

    if (this.showTimeOptions && !timeCtrl?.value) {
      timeCtrl?.setErrors({ required: true });
      timeCtrl?.markAsTouched();
    } else if (!this.showTimeOptions) {
      timeCtrl?.setErrors(null);
    }

    if (this.contactForm.valid) {
      this.isSubmitting = true;
      const fd = new FormData();
      Object.entries(this.contactForm.value).forEach(([key, val]) => {
        fd.append(key, String(val ?? ''));
      });
      this.inspirationFiles.forEach(file => fd.append('files', file, file.name));

      this.http.post('/api/contact', fd).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Tack!',
            detail: 'Din förfrågan har skickats. Jag återkommer inom 24 timmar.'
          });
          this.contactForm.reset();
          this.inspirationFiles = [];
          this.fileError = null;
          this.isSubmitting = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Något gick fel',
            detail: 'Kunde inte skicka förfrågan. Försök igen eller kontakta mig direkt.'
          });
          this.isSubmitting = false;
        }
      });
    } else {
      this.contactForm.markAllAsTouched();
      if (this.showTimeOptions && !timeCtrl?.value) {
        timeCtrl?.setErrors({ required: true });
        timeCtrl?.markAsTouched();
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Kontrollera formuläret',
        detail: 'Vänligen fyll i alla obligatoriska fält.'
      });
    }
  }
}
