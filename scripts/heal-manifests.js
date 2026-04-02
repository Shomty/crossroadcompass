#!/usr/bin/env node
/**
 * Heals Turbopack manifest duplicates caused by iCloud Drive file locking.
 *
 * Turbopack uses atomic rename (temp → final) to write manifests. iCloud Drive
 * locks files during sync, so the rename fails and Turbopack falls back to writing
 * "app-paths-manifest 2.json", "app-paths-manifest 3.json", etc. The server only
 * reads "app-paths-manifest.json", so the duplicate routes are never found.
 *
 * This script:
 *   1. Merges all "* N.json" variants into the canonical file
 *   2. Deletes the duplicates
 *   3. Marks .next and the Turbopack cache dir as iCloud-ignored (xattr)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const serverDir = path.join(__dirname, "../.next/dev/server");

function mergeManifestDuplicates(dir, baseName) {
  if (!fs.existsSync(dir)) return;

  const ext = ".json";
  const canonical = path.join(dir, baseName + ext);
  // Match "baseName N.json" (N = integer, space-separated)
  const pattern = new RegExp(`^${baseName} (\\d+)\\.json$`);
  const dupes = fs.readdirSync(dir).filter((f) => pattern.test(f));

  if (dupes.length === 0) return;

  let merged = fs.existsSync(canonical)
    ? JSON.parse(fs.readFileSync(canonical, "utf8"))
    : {};

  for (const dupe of dupes) {
    const dupePath = path.join(dir, dupe);
    const data = JSON.parse(fs.readFileSync(dupePath, "utf8"));
    Object.assign(merged, data);
    fs.unlinkSync(dupePath);
    console.log(`[heal-manifests] merged + removed ${dupe}`);
  }

  fs.writeFileSync(canonical, JSON.stringify(merged, null, 2));
  console.log(`[heal-manifests] ${baseName}.json now has ${Object.keys(merged).length} entries`);
}

mergeManifestDuplicates(serverDir, "app-paths-manifest");

// Mark iCloud-sensitive dirs as ignored
const toIgnore = [
  path.join(__dirname, "../.next"),
  path.join(process.env.HOME, "Library/Mobile Documents/turbopack"),
];

for (const dir of toIgnore) {
  if (fs.existsSync(dir)) {
    try {
      execSync(`xattr -w com.apple.fileprovider.ignore#P 1 "${dir}"`, { stdio: "ignore" });
    } catch {
      // Non-macOS or xattr not available — safe to ignore
    }
  }
}
