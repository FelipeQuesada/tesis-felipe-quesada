/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Oculta el indicador flotante (icono "N") en desarrollo; los errores siguen mostrándose cuando ocurren. */
  devIndicators: false,
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
};

module.exports = nextConfig;
