import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
      { protocol: 'https', hostname: 'cdn.busdriver.wtf' },
    ],
  },
};

export default nextConfig;
