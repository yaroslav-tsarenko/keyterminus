import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");

const BOARD = "#222426";
const HINGE = "#0E0F10";
const ON_BOARD = "#F2EDE1";
const BAR_NIGHT = "#E6B84A";
const BAR_DAY = "#D29D1A";
const INK_DAY = "#1B1C1D";
const INK_NIGHT = "#EEE9DE";

const FULL_KEY = "M64 256A86 86 0 1 1 236 256A86 86 0 1 1 64 256ZM106 256A44 44 0 1 0 194 256A44 44 0 1 0 106 256ZM226 235H404V277H372V340H338V277H330V318H296V277H226Z";
const FULL_BAR = { x: 404, y: 166, width: 42, height: 180 };
const SMALL_KEY = "M54 256A92 92 0 1 1 238 256A92 92 0 1 1 54 256ZM106 256A40 40 0 1 0 186 256A40 40 0 1 0 106 256ZM224 230H400V282H384V348H300V282H224Z";
const SMALL_BAR = { x: 400, y: 156, width: 52, height: 200 };

function tile(key, bar, hinge) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="40" fill="${BOARD}"/><path d="${key}" fill="${ON_BOARD}"/><rect x="${bar.x}" y="${bar.y}" width="${bar.width}" height="${bar.height}" fill="${BAR_NIGHT}"/><rect x="0" y="${256 - hinge / 2}" width="512" height="${hinge}" fill="${HINGE}"/></svg>`;
}

const small = tile(SMALL_KEY, SMALL_BAR, 12);
const full = tile(FULL_KEY, FULL_BAR, 8);

const lockupSource = await readFile(join(publicDir, "brand", "keyterminus-lockup.svg"), "utf8");
function lockup({ ink, bar, title = true, background = null }) {
  let svg = lockupSource.replace(/fill="#222426"/g, `fill="${ink}"`).replace(/fill="#D29D1A"/g, `fill="${bar}"`);
  if (!/<path transform="translate\(4301\.9 0\)"[^>]*fill=/.test(svg)) svg = svg.replace('<path transform="translate(4301.9 0)"', `<path transform="translate(4301.9 0)" fill="${ink}"`);
  if (title && !svg.includes("<title>")) svg = svg.replace(/<svg([^>]*)>/, '<svg$1 role="img" aria-label="Keyterminus"><title>Keyterminus</title>');
  if (background) svg = svg.replace(/(<svg[^>]*>(?:<title>[^<]*<\/title>)?)/, `$1<rect x="0" y="-1620" width="16186" height="2240" fill="${background}"/>`);
  return svg;
}

async function render(source, width, height = width) {
  return sharp(Buffer.from(source), { density: Math.max(72, Math.ceil((72 * Math.max(width, height)) / 32)) })
    .resize(width, height)
    .png()
    .toBuffer();
}

const targets = [
  { size: 16, name: "favicon-16x16.png", source: small },
  { size: 32, name: "favicon-32x32.png", source: small },
  { size: 180, name: "apple-touch-icon.png", source: full },
  { size: 192, name: "android-chrome-192x192.png", source: full },
  { size: 512, name: "android-chrome-512x512.png", source: full },
];

for (const { size, name, source } of targets) {
  await writeFile(join(publicDir, name), await render(source, size));
  console.log("Generated", name);
}

await writeFile(join(publicDir, "favicon.svg"), await readFile(join(root, "src", "app", "icon.svg")));
console.log("Copied favicon.svg from src/app/icon.svg");

await writeFile(join(publicDir, "logo.svg"), lockup({ ink: INK_DAY, bar: BAR_DAY }));
await writeFile(join(publicDir, "logo-dark.svg"), lockup({ ink: INK_NIGHT, bar: BAR_NIGHT }));
console.log("Generated logo.svg (Day) and logo-dark.svg (Night)");

const emailSvg = lockup({ ink: ON_BOARD, bar: BAR_NIGHT, title: false, background: BOARD }).replace("<svg ", '<svg width="1617" height="224" ');
await writeFile(join(publicDir, "email-logo.png"), await sharp(Buffer.from(emailSvg)).resize(404, 56, { fit: "contain", background: BOARD }).png().toBuffer());
console.log("Generated email-logo.png (404x56, shown at 202x28)");

const icoImages = [
  { size: 16, data: await render(small, 16) },
  { size: 32, data: await render(small, 32) },
  { size: 48, data: await render(small, 48) },
];

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoImages.length, 4);

let offset = 6 + icoImages.length * 16;
const entries = icoImages.map(({ size, data }) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(data.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += data.length;
  return entry;
});

await writeFile(join(publicDir, "favicon.ico"), Buffer.concat([header, ...entries, ...icoImages.map((i) => i.data)]));
console.log("Generated favicon.ico (16, 32, 48)");
