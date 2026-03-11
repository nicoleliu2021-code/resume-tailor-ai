/**
 * Icon Generator Script for PWA
 *
 * This script generates all required PWA icons from a source image.
 *
 * Requirements:
 *   npm install sharp
 *
 * Usage:
 *   node scripts/generate-icons.js
 *
 * Place your source icon (512x512 PNG) at: public/icon-source.png
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(__dirname, '../public/icon-source.png');
const outputDir = path.join(__dirname, '../public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  // Check if source icon exists
  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Source icon not found at:', sourceIcon);
    console.log('📝 Please create a 512x512 PNG icon at public/icon-source.png');
    console.log('🎨 Design tips:');
    console.log('   - Use a simple, recognizable design');
    console.log('   - Ensure good contrast');
    console.log('   - Keep important elements centered');
    console.log('   - Use solid colors that work well at small sizes');
    return;
  }

  console.log('🎨 Generating PWA icons...\n');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    try {
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 99, g: 102, b: 241, alpha: 1 } // #6366f1
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size}:`, error.message);
    }
  }

  // Generate shortcut icons
  const shortcuts = [
    { name: 'optimizer', color: { r: 147, g: 51, b: 234 } },
    { name: 'advisor', color: { r: 59, g: 130, b: 246 } }
  ];

  for (const shortcut of shortcuts) {
    const outputPath = path.join(outputDir, `shortcut-${shortcut.name}.png`);

    try {
      await sharp(sourceIcon)
        .resize(96, 96, {
          fit: 'contain',
          background: { ...shortcut.color, alpha: 1 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: shortcut-${shortcut.name}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate shortcut-${shortcut.name}:`, error.message);
    }
  }

  // Generate badge icon
  const badgePath = path.join(outputDir, 'badge-72x72.png');
  try {
    await sharp(sourceIcon)
      .resize(72, 72, {
        fit: 'contain',
        background: { r: 99, g: 102, b: 241, alpha: 1 }
      })
      .png()
      .toFile(badgePath);

    console.log(`✅ Generated: badge-72x72.png`);
  } catch (error) {
    console.error(`❌ Failed to generate badge:`, error.message);
  }

  console.log('\n✨ Icon generation complete!');
  console.log('📁 Icons saved to:', outputDir);
}

generateIcons().catch(console.error);
