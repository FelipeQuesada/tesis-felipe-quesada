const fs = require('fs');
const path = require('path');

/**
 * Turbopack a veces no inyecta `NEXT_PUBLIC_*` desde `.env.local` en el bundle cliente.
 * Cargamos el archivo aquí y lo pasamos por `env` para forzar strings en el cliente.
 */
function loadEnvLocalIntoProcess() {
  const candidates = [
    path.join(__dirname, '.env.local'),
    path.join(process.cwd(), '.env.local'),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;

    const raw = fs.readFileSync(filePath, 'utf8');
    const text = raw.replace(/^\uFEFF/, '');

    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;

      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();

      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }

      process.env[key] = val;
    }
    return;
  }
}

loadEnvLocalIntoProcess();

const NEXT_PUBLIC_FIREBASE_KEYS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const envPublicFirebase = {};
for (const key of NEXT_PUBLIC_FIREBASE_KEYS) {
  const v = process.env[key];
  if (v != null && String(v).trim() !== '') {
    envPublicFirebase[key] = v;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: envPublicFirebase,
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
};

module.exports = nextConfig;
