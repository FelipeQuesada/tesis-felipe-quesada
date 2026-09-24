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

/**
 * Config web pública de Firebase (mitaller-app). No son secretos de servidor:
 * siempre van al browser. Sirven de respaldo si Vercel omite alguna key en el build.
 */
const FIREBASE_PUBLIC_DEFAULTS = {
  NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyB7wIdK2_jWHG08jxqZ1dKU_PWcLC_ej-E',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'mitaller-app.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'mitaller-app',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'mitaller-app.firebasestorage.app',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '109270054352',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:109270054352:web:0e6c1bc8e2b537c41135d5',
};

const NEXT_PUBLIC_FIREBASE_KEYS = Object.keys(FIREBASE_PUBLIC_DEFAULTS);

const envPublicFirebase = {};
for (const key of NEXT_PUBLIC_FIREBASE_KEYS) {
  const v = process.env[key];
  envPublicFirebase[key] =
    v != null && String(v).trim() !== ''
      ? String(v).trim()
      : FIREBASE_PUBLIC_DEFAULTS[key];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Oculta el indicador flotante (icono "N") en desarrollo; los errores siguen mostrándose cuando ocurren. */
  devIndicators: false,
  env: envPublicFirebase,
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
};

module.exports = nextConfig;
