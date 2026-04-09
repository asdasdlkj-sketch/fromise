/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 't1.daumcdn.net' },
      { protocol: 'https', hostname: 'map2.daumcdn.net' }
    ]
  }
};

module.exports = nextConfig;
