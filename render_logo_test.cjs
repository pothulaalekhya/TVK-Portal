const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testLogo() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });

  const svgContent = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" class="tvk-brand-logo" width="320" height="120">
    <defs>
      <!-- Subtle gradient for the cyan arm if desired -->
      <linearGradient id="cyanArmGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0096B7" />
        <stop offset="100%" stop-color="#00C4E6" />
      </linearGradient>
    </defs>

    <!-- 'T' in Navy -->
    <!-- Top bar serifs + stem + bottom base serifs -->
    <path class="tvk-letter-navy" fill="#242C75" d="
      M 16 38
      L 16 52 L 23 52 L 23 44
      L 45 44 L 45 92
      L 37 92 L 37 98 L 65 98 L 65 92 L 57 92
      L 57 44 L 79 44 L 79 52 L 86 52 L 86 38
      Z
    " />

    <!-- 'V' in Navy -->
    <path class="tvk-letter-navy" fill="#242C75" d="
      M 95 38
      L 95 44 L 103 44
      L 120 89 L 126 89
      L 143 44 L 151 44 L 151 38
      L 132 38 L 132 44 L 137 44
      L 123 80
      L 109 44 L 114 44 L 114 38
      Z
    " />

    <!-- 'K' - Vertical Stem and serifs in Navy -->
    <path class="tvk-letter-navy" fill="#242C75" d="
      M 160 38
      L 160 44 L 168 44
      L 168 92 L 160 92 L 160 98
      L 188 98 L 188 92 L 180 92
      L 180 44 L 188 44 L 188 38
      Z
    " />

    <!-- 'K' - Bottom Diagonal Leg in Navy with foot serif -->
    <path class="tvk-letter-navy" fill="#242C75" d="
      M 197 68
      L 219 92 L 213 92 L 213 98
      L 242 98 L 242 92 L 236 92
      L 208 61
      L 197 68
      Z
    " />

    <!-- 'K' - Top Diagonal Arm in Vibrant Cyan / Turquoise -->
    <!-- Ascending beam pointing to the graduation cap -->
    <polygon points="183,68 193,68 238,36 222,36" fill="#00A8CC" />

    <!-- Graduation Cap on the cyan beam -->
    <!-- Gold / Amber Base Band -->
    <rect x="222" y="30" width="18" height="6.5" rx="1" fill="#F59E0B" />

    <!-- Mortarboard Diamond Top (Navy #242C75 or deep navy #1B2155) -->
    <!-- Rotated diamond rhombus -->
    <polygon points="231,18 253,23 231,28 209,23" fill="#1B2155" />
    <!-- Underside shadow of mortarboard cap -->
    <polygon points="214,24.2 231,28.8 248,24.2 248,26 231,30.5 214,26" fill="#141840" />

    <!-- Center Button on Mortarboard (Gold) -->
    <circle cx="231" cy="23" r="1.8" fill="#F59E0B" />

    <!-- Golden Tassel draping from center to right side -->
    <!-- Tassel cord -->
    <path d="M 231 23 Q 242 22 248 24 L 248 31" fill="none" stroke="#F59E0B" stroke-width="1.8" stroke-linecap="round" />
    <!-- Tassel fringed bobble -->
    <circle cx="248" cy="32.5" r="2.2" fill="#F59E0B" />
  </svg>
  `;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { background: white; margin: 0; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
      .preview { padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: white; }
    </style>
  </head>
  <body>
    <div class="preview">
      ${svgContent}
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  const clip = await page.$('.preview');
  await clip.screenshot({ path: 'test_logo_render.png' });
  await browser.close();
  console.log('Saved test_logo_render.png');
}

testLogo().catch(err => { console.error(err); process.exit(1); });
