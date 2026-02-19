import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
  webpack: (config) => {
    // Ignore node-specific modules when bundling for the browser
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-node": false,
    };
    return config;
  },
};

export default nextConfig;
