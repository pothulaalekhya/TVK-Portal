import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testLogo() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 700 });

  function getLogoSvg(navyColor, capColor = navyColor) {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 105" class="tvk-logo" height="42" style="display: block; overflow: visible;">
      <g id="tvk-brand-mark">
        <!-- 'T' - Bold Slab Serif -->
        <path fill="${navyColor}" d="
          M 10 28
          L 10 42 L 19 42 L 19 36
          L 41 36
          L 41 85
          L 31 85 L 31 92 L 67 92 L 67 85 L 57 85
          L 57 36
          L 79 36 L 79 42 L 88 42 L 88 28
          Z
        " />

        <!-- 'V' - Bold Slab Serif -->
        <path fill="${navyColor}" d="
          M 85 28
          L 85 38 L 94 38
          L 114 85 L 125 85
          L 145 38 L 154 38 L 154 28
          L 133 28 L 133 38 L 139 38
          L 121 78
          L 103 38 L 109 38 L 109 28
          Z
        " />

        <!-- 'K' - Vertical Stem and Serifs -->
        <path fill="${navyColor}" d="
          M 152 28
          L 152 38 L 161 38
          L 161 85 L 152 85 L 152 92
          L 186 92 L 186 85 L 177 85
          L 177 38 L 186 38 L 186 28
          Z
        " />

        <!-- 'K' - Lower Diagonal Leg with Serif -->
        <path fill="${navyColor}" d="
          M 197 61
          L 223 85 L 217 85 L 217 92
          L 249 92 L 249 85 L 241 85
          L 211 55
          L 197 61
          Z
        " />

        <!-- 'K' - Upper Diagonal Arm in Vivid Cyan / Turquoise -->
        <polygon points="184,65 195,65 238,27 223,27" fill="#00A8CC" />

        <!-- Cap Base Band (Gold / Amber) -->
        <rect x="221" y="21" width="18" height="7" rx="0.8" fill="#F59E0B" />

        <!-- Mortarboard Diamond Top -->
        <polygon points="230,9 254,15 230,20 206,15" fill="${capColor}" />
        <polygon points="211,16 230,20.5 249,16 249,17.8 230,22.2 211,17.8" fill="#131742" />

        <!-- Gold Button -->
        <circle cx="230" cy="15" r="1.8" fill="#F59E0B" />

        <!-- Golden Tassel -->
        <path d="M 230 15 Q 242 13 248 16 L 248 24" fill="none" stroke="#F59E0B" stroke-width="1.8" stroke-linecap="round" />
        <circle cx="248" cy="25.5" r="2.2" fill="#F59E0B" />
      </g>
    </svg>
    `;
  }

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { background: #e2e8f0; margin: 0; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px; font-family: sans-serif; }
      .preview-light {
        padding: 20px 30px;
        border-radius: 14px;
        background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .preview-dark {
        padding: 20px 30px;
        border-radius: 14px;
        background: #0f172a;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .brand-text { display: flex; flex-direction: column; }
      .brand-title { font-size: 17px; font-weight: 800; line-height: 1.1; }
      .brand-sub { font-size: 11px; font-weight: 500; margin-top: 2px; }
    </style>
  </head>
  <body>
    <!-- Light Mode Preview -->
    <div class="preview-light" id="box-light">
      ${getLogoSvg('#242C75', '#1B2260')}
      <div class="brand-text">
        <span class="brand-title" style="color: #0f172a;">TVK Technologies</span>
        <span class="brand-sub" style="color: #64748b;">Training & Placement Institute • Bangalore | Chennai</span>
      </div>
    </div>

    <!-- Dark Mode Preview -->
    <div class="preview-dark" id="box-dark">
      ${getLogoSvg('#ffffff', '#cbd5e1')}
      <div class="brand-text">
        <span class="brand-title" style="color: #f8fafc;">TVK Technologies</span>
        <span class="brand-sub" style="color: #94a3b8;">Training & Placement Institute • Bangalore | Chennai</span>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  await page.screenshot({ path: 'test_logo_both_modes.png' });
  await browser.close();
  console.log('Saved test_logo_both_modes.png');
}

testLogo().catch(err => { console.error(err); process.exit(1); });
