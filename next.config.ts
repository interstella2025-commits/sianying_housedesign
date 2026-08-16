import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source:
          "/234602083935373353363328735037204622591036027653723272432996234602083935373.html",
        destination: "/services",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
