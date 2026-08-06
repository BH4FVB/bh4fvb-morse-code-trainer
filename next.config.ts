import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryPath = "/bh4fvb-morse-code-trainer";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? repositoryPath : "",
  assetPrefix: isGitHubPages ? repositoryPath : "",
  images: { unoptimized: true },
};

export default nextConfig;
