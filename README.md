# ALEX TATTOO Website

En modern, mörk och premium webbsida för tatuerare byggd med **Angular 19**, **PrimeNG**, **Tailwind CSS** och **Google Sheets** som CMS.

## 🚀 Kom igång (dev)

### Förutsättningar
- Node.js (v18 eller senare)
- npm

### Installation

1. `npm install`
2. Skapa `.env` med nödvändiga variabler (se nedan)
3. `npm run dev` – startar API (port 4000) och Angular (port 4200) parallellt

> Besök `http://localhost:4200`

> `npm start` startar bara Angular (använd om API:t körs separat).

## ⚙️ Google Sheets CMS Konfiguration

Webbplatsen hämtar allt innehåll text och bilder från ett Google Sheet. För att detta ska fungera måste du skapa ett ark och en API-nyckel.

### 1. Skapa Google Sheet
Skapa ett nytt Google Spreadsheet och lägg till följande flikar (Sheets) exakt som nedan:

#### Flik: `content`
| key | value |
|---|---|
| hero_tagline | Dark art. Clean lines. Timeless ink. |
| about_title | Om Alex |
| about_text | [Din presentationstext här...] |
| cta_text | Boka tid |

#### Flik: `gallery`
| id | title | category | description | imageUrl | createdAt |
|---|---|---|---|---|---|
| 1 | Rose Skull | Blackwork | Detaljerad ros... | https://... | 2025-01-01 |
| 2 | Snake | Fineline | Orm på armen... | https://... | 2025-01-05 |

#### Flik: `categories`
| id | name |
|---|---|
| 1 | Blackwork |
| 2 | Fineline |
| 3 | Realism |

#### Flik: `contact`
| key | value |
|---|---|
| studio_name | Alex Tattoo Studio |
| city | Stockholm |
| address | Exempelgatan 12 |
| email | contact@alextattoo.com |
| phone | +46 70 000 00 00 |
| open_hours | Mån–Fre 10–18 |

### 2. Hämta Spreadsheet ID
ID:t är den långa strängen i URL:en för ditt ark:
`https://docs.google.com/spreadsheets/d/`**`DITT_SPREADSHEET_ID`**`/edit...`

### 3. Skapa API Nyckel (Google Cloud Console)
1. Gå till [Google Cloud Console](https://console.cloud.google.com/).
2. Skapa ett nytt projekt.
3. Aktivera **Google Sheets API**.
4. Skapa **Credentials** -> **API Key**.
5. (Valfritt men rekommenderat) Begränsa nyckeln till endast Sheets API och din domän.

### 4. Uppdatera Environment
Öppna `src/environments/environment.ts` (för prod) och `src/environments/environment.development.ts` (för dev) och fyll i dina uppgifter:

```typescript
export const environment = {
  production: false,
  googleSheetsApiKey: 'DIN_NYA_API_KEY',
  spreadsheetId: 'DITT_SPREADSHEET_ID'
};
```

## 🛠 Bygg för produktion

För att skapa en optimerad produktions-build:

```bash
npm run build
```

Filerna hamnar i `dist/alex-tattoo/browser`. Dessa filer kan laddas upp till valfritt webbhotell (Netlify, Vercel, Firebase Hosting, etc).

## 🎨 Styling

Projektet använder **Tailwind CSS** för utility-klasser och **PrimeNG** för komponenter.

- **Globala stilar**: `src/styles.scss` (Dark theme variabler).
- **Tema**: PrimeNG Aura (Dark).
- **Typsnitt**: Playfair Display (Rubriker) & Inter (Brödtext).

## 📁 Projektstruktur

- `src/app/services/google-sheets.service.ts`: Hanterar API-anrop.
- `src/app/models/sheets.model.ts`: Typer och Interfaces.
- `src/app/components/layout`: Header och Footer.
- `src/app/pages`: Home, Gallery, Contact.
