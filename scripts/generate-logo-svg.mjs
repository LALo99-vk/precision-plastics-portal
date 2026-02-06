/**
 * Generate SVG wordmark from VINET.TTF font — single line "NYLOKING & CO."
 * Outputs: src/assets/nyloking-logo.svg
 *
 * Blue (#2E3AA8) fill + thin white inner stroke via clipPath
 */

import opentype from 'opentype.js';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontPath = resolve(__dirname, '../public/fonts/VINET.TTF');
const outputPath = resolve(__dirname, '../src/assets/nyloking-logo.svg');

const FILL_COLOR = '#2E3AA8';
const INNER_STROKE_COLOR = '#FFFFFF';
const INNER_STROKE_WIDTH = 1.8;
const FONT_SIZE = 72;

const font = opentype.loadSync(fontPath);

// Single line: "NYLOKING & CO."
const text = 'NYLOKING & CO.,';
const path = font.getPath(text, 0, 0, FONT_SIZE);
const bb = path.getBoundingBox();

// Shift so top-left is near 0,0
const offsetX = -bb.x1;
const offsetY = -bb.y1;

const finalPath = font.getPath(text, offsetX, offsetY, FONT_SIZE);
const d = finalPath.toPathData(2);

const fb = finalPath.getBoundingBox();
const padding = 4;
const viewX = fb.x1 - padding;
const viewY = fb.y1 - padding;
const viewW = (fb.x2 - fb.x1) + padding * 2;
const viewH = (fb.y2 - fb.y1) + padding * 2;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewX.toFixed(1)} ${viewY.toFixed(1)} ${viewW.toFixed(1)} ${viewH.toFixed(1)}" fill="none" role="img" aria-label="Nyloking &amp; Co.">
  <defs>
    <clipPath id="text-clip">
      <path d="${d}"/>
    </clipPath>
  </defs>
  <!-- Blue fill -->
  <path d="${d}" fill="${FILL_COLOR}"/>
  <!-- White inner stroke (clipped to letter interior) -->
  <path d="${d}" fill="none" stroke="${INNER_STROKE_COLOR}" stroke-width="${INNER_STROKE_WIDTH}" clip-path="url(#text-clip)"/>
</svg>`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, svg, 'utf-8');
console.log(`SVG wordmark written to ${outputPath}`);
console.log(`ViewBox: ${viewX.toFixed(1)} ${viewY.toFixed(1)} ${viewW.toFixed(1)} ${viewH.toFixed(1)}`);
