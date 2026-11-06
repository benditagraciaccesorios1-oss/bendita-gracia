import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // Snowflake figures joined the seasonal figures line priced in the brand document.
  async redirects() {
    return [
      { source: '/catalogo/copos-en-caja', destination: '/catalogo/figuras-navidenas', permanent: true },
      // The star candles on a pearl base became a reference option of the noche de velitas line.
      { source: '/catalogo/figuras-con-estrella', destination: '/catalogo/noche-de-velitas', permanent: true },
    ];
  },
};

export default config;
