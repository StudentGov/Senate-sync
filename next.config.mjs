import path from "node:path";

/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: {
    // Do NOT block production builds on ESLint errors
    ignoreDuringBuilds: true
  },
  outputFileTracingRoot: path.join(process.cwd())
};

export default nextConfig;
