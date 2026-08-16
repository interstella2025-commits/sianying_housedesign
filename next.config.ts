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
      {
        source: "/22283385552951838917.html",
        destination: "/awards",
        permanent: true,
      },
      {
        source: "/38364260442510520497.html",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/3857731169274022591931574.html",
        destination: "/privacy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
