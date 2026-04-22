import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const repo = "neuro-notes";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubPages ? `/${repo}` : "",
  assetPrefix: isGithubPages ? `/${repo}/` : "",
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
