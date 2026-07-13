import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "strob.vercel.app" }],
        destination: "https://strob.menhir-holdings.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "strob-menhir-tech.vercel.app" }],
        destination: "https://strob.menhir-holdings.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
