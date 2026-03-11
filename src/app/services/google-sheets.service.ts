import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, defer } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ContactInfo, SheetContent, SiteData } from '../models/sheets.model';

@Injectable({ providedIn: 'root' })
export class GoogleSheetsService {
    private http = inject(HttpClient);

    private readonly spreadsheetId = environment.spreadsheetId;
    private readonly apiKey = environment.googleSheetsApiKey;
    private readonly baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values:batchGet`;

    private readonly valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values`;

    private siteData$?: Observable<SiteData>;
    private translations$?: Observable<Record<string, Record<string, string>>>;
    private blockedUntil = 0;

    loading = signal(false);
    error = signal<string | null>(null);

    private mockContent: SheetContent = {
        hero_tagline: 'Dark art. Clean lines. Timeless ink.',
        about_title: 'Om Alex',
        about_text:
            'Alex är en tatuerare specialiserad på blackwork och fineline. Med över 10 års erfarenhet skapar han unika verk som håller livet ut.',
        cta_text: 'Boka din tid idag',
    };

    private mockContact: ContactInfo = {
        studio_name: 'Alex Tattoo Studio',
        city: 'Stockholm',
        address: 'Exempelgatan 12',
        email: 'contact@alextattoo.com',
        phone: '+46 70 000 00 00',
        open_hours: 'Mån–Fre 10–18',
    };

    loadAll(): Observable<SiteData> {
        if (this.siteData$) return this.siteData$;

        if (!this.spreadsheetId || !this.apiKey) {
            this.siteData$ = of(this.buildMock()).pipe(shareReplay(1));
            return this.siteData$;
        }

        if (Date.now() < this.blockedUntil) {
            this.siteData$ = of(this.buildMock()).pipe(shareReplay(1));
            return this.siteData$;
        }

        this.siteData$ = defer(() => {
            this.loading.set(true);
            this.error.set(null);

            const params = new HttpParams()
                .set('key', this.apiKey)
                .append('ranges', 'content!A:B')
                .append('ranges', 'contact!A:B');

            return this.http.get<any>(this.baseUrl, { params }).pipe(
                map((res) => this.mapResponse(res)),
                tap(() => this.loading.set(false)),
                catchError((err) => {
                    this.loading.set(false);

                    if (err?.status === 429) {
                        this.blockedUntil = Date.now() + 60_000;
                    }

                    this.error.set('Using offline data.');
                    const mock = this.buildMock();
                    this.siteData$ = of(mock).pipe(shareReplay(1));
                    return this.siteData$;
                }),
                shareReplay(1)
            );
        });

        return this.siteData$;
    }

    getContent(): Observable<SheetContent> {
        return this.loadAll().pipe(map((d) => d.content));
    }

    getContact(): Observable<ContactInfo> {
        return this.loadAll().pipe(map((d) => d.contact));
    }

    refresh(): void {
        this.siteData$ = undefined;
        this.translations$ = undefined;
    }

    getTranslations(): Observable<Record<string, Record<string, string>>> {
        if (this.translations$) return this.translations$;

        if (!this.spreadsheetId || !this.apiKey) {
            this.translations$ = of({}).pipe(shareReplay(1));
            return this.translations$;
        }

        const params = new HttpParams()
            .set('key', this.apiKey);

        this.translations$ = this.http
            .get<any>(`${this.valuesUrl}/translations!A:C`, { params })
            .pipe(
                map((res) => this.mapTranslations(res?.values ?? [])),
                catchError(() => of({})),
                shareReplay(1)
            );

        return this.translations$;
    }

    private buildMock(): SiteData {
        return {
            content: this.mockContent,
            contact: this.mockContact,
            translations: {},
        };
    }

    private mapResponse(res: any): SiteData {
        const ranges = res?.valueRanges;
        if (!ranges || ranges.length < 2) throw new Error('Invalid Sheets response');

        const contentRows = ranges.find((r: any) => r.range.includes('content!'))?.values ?? [];
        const contactRows = ranges.find((r: any) => r.range.includes('contact!'))?.values ?? [];

        return {
            content: this.mapContent(contentRows),
            contact: this.mapContact(contactRows),
            translations: {},
        };
    }

    private mapTranslations(rows: string[][]): Record<string, Record<string, string>> {
        const out: Record<string, Record<string, string>> = {};
        for (const [key, sv, en] of rows) {
            if (!key) continue;
            out[key] = { sv: sv ?? '', en: en ?? sv ?? '' };
        }
        return out;
    }

    private mapContent(rows: string[][]): SheetContent {
        const out: SheetContent = {
            hero_tagline: '',
            about_title: '',
            about_text: '',
            cta_text: '',
        };

        for (const [key, value] of rows) {
            if (!key) continue;

            if (key in out) {
                (out as any)[key] = value ?? '';
            }
        }

        return out;
    }

    private mapContact(rows: string[][]): ContactInfo {
        const out: ContactInfo = {
            studio_name: '',
            city: '',
            address: '',
            email: '',
            phone: '',
            open_hours: '',
        };

        for (const [key, value] of rows) {
            if (!key) continue;

            if (key in out) {
                (out as any)[key] = value ?? '';
            }
        }

        return out;
    }
}