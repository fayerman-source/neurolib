import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
