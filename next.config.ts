import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** ui-react only — core must stay external so swisseph-wasm keeps real import.meta.url paths. */
  transpilePackages: ["@node-jhora/ui-react"],
  // Prevent Turbopack/webpack from bundling native Node modules.
  // sweph (Swiss Ephemeris) and openhumandesign-library use .node binaries
  // that must remain as external CommonJS requires at runtime.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
    "sweph",
    "swisseph",
    /** @node-jhora/core 1.x — WASM + data must load via real package paths (import.meta.url). */
    "swisseph-wasm",
    "@node-jhora/core",
    "openhumandesign-library",
    "openastrology-library",
    "luxon",
    "@libsql/darwin-arm64",
    "@libsql/client",
    "@prisma/adapter-libsql",
  ],
};

export default nextConfig;
