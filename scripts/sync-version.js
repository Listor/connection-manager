#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "..");

const { version } = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8")
);

const manifests = [
  "public/manifest.json",
  "public/manifest-firefox.json",
  "public-firefox/manifest.json",
];

for (const rel of manifests) {
  const file = path.join(root, rel);
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
  if (manifest.version === version) {
    console.log(`✅ ${rel} already at ${version}`);
    continue;
  }
  manifest.version = version;
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`✅ ${rel} updated to ${version}`);
}
