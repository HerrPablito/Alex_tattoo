const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const result = require('dotenv').config({ path: envPath });
    if (result.error) {
        throw result.error;
    }
} else {
    console.warn('.env file not found, using existing environment variables');
}

// Target files
const targetPath = path.resolve(__dirname, '../src/environments/environment.ts');
const targetPathDev = path.resolve(__dirname, '../src/environments/environment.development.ts');

// Environment values
const envConfigFile = `export const environment = {
    production: true,
    googleSheetsApiKey: '${process.env.GOOGLE_SHEETS_API_KEY || ''}',
    spreadsheetId: '${process.env.SPREADSHEET_ID || ''}',
    cloudinary: {
        cloudName: '${process.env.CLOUDINARY_CLOUD_NAME || ''}',
        apiKey: '${process.env.CLOUDINARY_API_KEY || ''}'
    }
};
`;

const envConfigDevFile = `export const environment = {
    production: false,
    googleSheetsApiKey: '${process.env.GOOGLE_SHEETS_API_KEY || ''}',
    spreadsheetId: '${process.env.SPREADSHEET_ID || ''}',
    cloudinary: {
        cloudName: '${process.env.CLOUDINARY_CLOUD_NAME || ''}',
        apiKey: '${process.env.CLOUDINARY_API_KEY || ''}'
    }
};

`;

// Write files
fs.writeFileSync(targetPath, envConfigFile);
fs.writeFileSync(targetPathDev, envConfigDevFile);

console.log(`Output generated at ${targetPath}`);
console.log(`Output generated at ${targetPathDev}`);
