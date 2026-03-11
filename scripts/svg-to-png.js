/**
 * SVG to PNG Converter
 *
 * Converts the SVG source icon to PNG format for icon generation
 *
 * Requirements:
 *   npm install sharp
 *
 * Usage:
 *   node scripts/svg-to-png.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceSvg = path.join(__dirname, '../public/icon-source.svg');
const outputPng = path.join(__dirname, '../public/icon-source.png');

async function convertSvgToPng() {
  try {
    // Check if SVG exists
    if (!fs.existsSync(sourceSvg)) {
      console.error('❌ Source SVG not found at:', sourceSvg);
      return;
    }

    console.log('🎨 Converting SVG to PNG...');

    // Convert SVG to 512x512 PNG
    await sharp(sourceSvg)
      .resize(512, 512)
      .png()
      .toFile(outputPng);

    console.log('✅ Successfully created:', outputPng);
    console.log('📝 Now run: node scripts/generate-icons.js');
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
  }
}

convertSvgToPng().catch(console.error);
