import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/new",
        destination: "/",
        permanent: true,
      },
      {
        source: "/new/about",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/new/blog",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/new/contact",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/new/projects",
        destination: "/projects/new",
        permanent: true,
      },
      {
        source: "/new/projects/:path*",
        destination: "/projects/:path*",
        permanent: true,
      },
      {
        source: "/works",
        destination: "/projects/new",
        permanent: true,
      },
      {
        source: "/press",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/awards",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/services",
        destination: "/contact",
        permanent: true,
      },
      {
        source:
          "/234602083935373353363328735037204622591036027653723272432996234602083935373.html",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/22283385552951838917.html",
        destination: "/blog",
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
