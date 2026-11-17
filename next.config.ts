import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // The site is served from the root of the custom domain getgoshorty.co.uk.
  // Do not add the old GitHub Pages /goshorty path prefix.
  basePath: ""
};

export default nextConfig;
