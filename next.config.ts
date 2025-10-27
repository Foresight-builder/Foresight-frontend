import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许通过环境变量自定义构建目录，便于并行预览
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
