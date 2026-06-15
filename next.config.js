/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      cesium: { browser: 'cesium/Build/Cesium/Cesium.js' },
    },
  },
};