import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    DATABASE_URL: "postgresql://postgres:password@localhost:5432/mydb?schema=public",
  },
};

export default nextConfig;
