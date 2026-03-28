import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack/webpack from bundling native Node modules.
  // sweph (Swiss Ephemeris) and openhumandesign-library use .node binaries
  // that must remain as external CommonJS requires at runtime.
  serverExternalPackages: [
    "sweph",
    "swisseph",
    "openhumandesign-library",
    "openastrology-library",
    "luxon",
    "@libsql/darwin-arm64",
    "@libsql/client",
    "@prisma/adapter-libsql",
  ],
};

export default nextConfig;
