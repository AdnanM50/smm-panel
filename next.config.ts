import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_API_URL: 'https://smm-panel-khan-it.up.railway.app/api',
  },
};

export default nextConfig;
