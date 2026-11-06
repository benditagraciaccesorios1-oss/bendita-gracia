import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // Snowflake figures joined the seasonal figures line priced in the brand document.
  async redirects() {
    return [{ source: '/catalogo/copos-en-caja', destination: '/catalogo/figuras-navidenas', permanent: true }];
  },
};

export default config;
