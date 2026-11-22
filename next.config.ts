import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const repo = "neurolib";
const basePath = isGithubPages ? `/${repo}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: isGithubPages ? `/${repo}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
