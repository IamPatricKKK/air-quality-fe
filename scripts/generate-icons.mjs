import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const source = resolve(root, "public/icons/icon-source.svg");
const outDir = resolve(root, "public/icons");

mkdirSync(outDir, { recursive: true });

const targets = [
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
  { size: 180, name: "apple-touch-icon.png" },
];

await Promise.all(
  targets.map(({ size, name }) =>
    sharp(source).resize(size, size).png().toFile(resolve(outDir, name)),
  ),
);

await sharp(source)
  .resize(410, 410)
  .extend({
    top: 51,
    bottom: 51,
    left: 51,
    right: 51,
    background: { r: 10, g: 14, b: 26, alpha: 1 },
  })
  .png()
  .toFile(resolve(outDir, "icon-512-maskable.png"));

console.log("PWA icons generated:");
for (const { name } of targets) console.log(`  - public/icons/${name}`);
console.log("  - public/icons/icon-512-maskable.png");
