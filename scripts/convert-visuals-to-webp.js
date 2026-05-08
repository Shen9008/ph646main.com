/**
 * Convert all raster images under images/ (jpg, jpeg, png) to WebP alongside sources,
 * then update references in HTML, CSS, JS, and JSON across the repo.
 *
 * Run: node scripts/convert-visuals-to-webp.js
 * Keep sources but skip re-converting if dest is newer: set SKIP_UP_TO_DATE=1
 * Remove sources after convert: DELETE_ORIGINALS=1 (optional)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'images');
const TEXT_EXTENSIONS = new Set(['.html', '.htm', '.css', '.js', '.mjs', '.cjs', '.json']);
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.cache']);
const RASTER_RE = /\.(jpe?g|png)$/i;

const SKIP_UP_TO_DATE = process.env.SKIP_UP_TO_DATE === '1';
const DELETE_ORIGINALS = process.env.DELETE_ORIGINALS === '1';

function walkRasterFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkRasterFiles(full, acc);
    } else if (ent.isFile() && RASTER_RE.test(ent.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function walkTextFiles(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.') && ent.name !== '.github') continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (IGNORE_DIRS.has(ent.name)) continue;
      walkTextFiles(full, acc);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (TEXT_EXTENSIONS.has(ext)) acc.push(full);
    }
  }
  return acc;
}

function posixRel(absPath) {
  return path.relative(ROOT, absPath).split(path.sep).join('/');
}

function pathVariants(rel) {
  const r = rel.replace(/\\/g, '/');
  const out = new Set([r, '/' + r, 'https://ph646main.com/' + r]);
  for (let d = 1; d <= 8; d++) {
    out.add('../'.repeat(d) + r);
  }
  return [...out];
}

async function convertOne(srcPath, destPath) {
  if (SKIP_UP_TO_DATE && fs.existsSync(destPath)) {
    const stS = fs.statSync(srcPath);
    const stD = fs.statSync(destPath);
    if (stD.mtimeMs >= stS.mtimeMs) return 'skip-date';
  }
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const lower = srcPath.toLowerCase();
  const options = lower.endsWith('.png')
    ? { quality: 90, alphaQuality: 100, effort: 4 }
    : { quality: 85, effort: 4 };
  await sharp(srcPath).webp(options).toFile(destPath);
  return 'ok';
}

function buildReplacementMap(rasterFiles) {
  const map = new Map();
  for (const abs of rasterFiles) {
    const rel = posixRel(abs);
    for (const v of pathVariants(rel)) {
      map.set(v, v.replace(RASTER_RE, '.webp'));
    }
  }
  return [...map.entries()].sort((a, b) => b[0].length - a[0].length);
}

function patchContent(raw) {
  let content = raw;
  for (const [from, to] of replacementPairs) {
    if (content.includes(from)) content = content.split(from).join(to);
  }
  return content
    .split('\n')
    .map((line) => {
      if (line.includes('.webp') && line.includes('type="image/webp"') && /<link\b/i.test(line)) {
        return line.replace(/type="image\/png"/gi, 'type="image/webp"');
      }
      return line;
    })
    .join('\n');
}

let replacementPairs = [];

async function main() {
  const rasterFiles = walkRasterFiles(IMAGES_DIR);
  console.log('Raster files found:', rasterFiles.length);

  let converted = 0;
  let skipped = 0;
  let errors = 0;

  for (const srcPath of rasterFiles) {
    const destPath = path.join(path.dirname(srcPath), path.basename(srcPath).replace(RASTER_RE, '.webp'));
    try {
      const status = await convertOne(srcPath, destPath);
      if (status === 'skip-date') {
        skipped++;
        continue;
      }
      console.log('OK', posixRel(destPath));
      converted++;
    } catch (e) {
      console.error('ERR', posixRel(srcPath), e.message);
      errors++;
    }
  }

  if (DELETE_ORIGINALS) {
    for (const srcPath of rasterFiles) {
      try {
        if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
      } catch (_) {}
    }
  }

  replacementPairs = buildReplacementMap(rasterFiles);
  const textFiles = walkTextFiles(ROOT);
  let patched = 0;
  for (const file of textFiles) {
    const relFile = posixRel(file);
    if (relFile.startsWith('images/')) continue;
    let raw;
    try {
      raw = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const next = patchContent(raw);
    if (next !== raw) {
      fs.writeFileSync(file, next, 'utf8');
      console.log('PATCH', relFile);
      patched++;
    }
  }

  console.log('\nDone. WebP written:', converted, 'skipped (up-to-date):', skipped, 'errors:', errors);
  console.log('Files patched:', patched, 'replacement rules:', replacementPairs.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
