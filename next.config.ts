import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public', // Service worker akan di-generate ke folder public
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Matiin PWA pas lagi ngoding biar nggak nyangkut di cache
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Kalau ada config lain, biarin aja di sini
};

export default withPWA(nextConfig);