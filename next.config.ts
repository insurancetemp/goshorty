import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages serves this project from /goshorty rather than the domain root.
  // Local builds and future custom-domain builds keep the root path.
  basePath: process.env.GITHUB_PAGES === "true" ? "/goshorty" : ""
};

export default nextConfig;
