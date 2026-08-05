/**
 * Builds the site favicons from the Thailand Kitchens logo.
 *
 * The full logo lockup is unreadable below ~64px, so only the "TK" monogram is
 * used, recoloured cream on the brand dark square for legibility against both
 * light and dark browser chrome.
 *
 * Run with: node scripts/generate-favicon.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE = "public/logo1.png";
const APP_DIR = "src/app";

const BG = { r: 0x1a, g: 0x1a, b: 0x1a };
const FG = { r: 0xf5, g: 0xf3, b: 0xef };

// Monogram bounds within logo1.png, measured from the alpha channel
const CROP = { left: 377, top: 0, width: 318, height: 210 };

/**
 * Share of the canvas the monogram spans. Kept high because the logo strokes
 * are thin and start to disappear at 16px with heavier padding.
 */
const MARK_SCALE = 0.8;

/** Recolour the monogram by using its alpha as a mask over a solid fill. */
async function buildMark(size) {
  const boxW = Math.round(size * MARK_SCALE);
  const boxH = Math.round((boxW * CROP.height) / CROP.width);

  const alpha = await sharp(SOURCE)
    .extract(CROP)
    .resize(boxW, boxH, { fit: "fill" })
    .ensureAlpha()
    .extractChannel("alpha")
    .toBuffer();

  const fill = await sharp({
    create: {
      width: boxW,
      height: boxH,
      channels: 3,
      background: FG,
    },
  })
    .png()
    .toBuffer();

  const mark = await sharp(fill).joinChannel(alpha).png().toBuffer();
  return { mark, boxW, boxH };
}

async function buildIcon(size) {
  const { mark, boxW, boxH } = await buildMark(size);

  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([
      {
        input: mark,
        left: Math.round((size - boxW) / 2),
        top: Math.round((size - boxH) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Minimal ICO container wrapping PNG frames (supported since Windows Vista). */
function wrapIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(frames.length, 4);

  let offset = 6 + frames.length * 16;
  const entries = [];

  for (const { size, data } of frames) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }

  return Buffer.concat([
    header,
    ...entries,
    ...frames.map((f) => f.data),
  ]);
}

async function main() {
  await mkdir(APP_DIR, { recursive: true });

  const icon512 = await buildIcon(512);
  await writeFile(path.join(APP_DIR, "icon.png"), icon512);

  const apple180 = await buildIcon(180);
  await writeFile(path.join(APP_DIR, "apple-icon.png"), apple180);

  const icoFrames = [];
  for (const size of [16, 32, 48]) {
    icoFrames.push({ size, data: await buildIcon(size) });
  }
  await writeFile(path.join(APP_DIR, "favicon.ico"), wrapIco(icoFrames));

  console.log("wrote icon.png (512), apple-icon.png (180), favicon.ico (16/32/48)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
