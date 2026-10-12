const puppeteer = require('puppeteer-core');

async function capturePhases() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:4200/home', { waitUntil: 'networkidle2' });

  const wrapperOffset = await page.evaluate(() => {
    const el = document.getElementById('wrapper-step-swap');
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return window.scrollY + rect.top;
  });

  console.log('wrapperOffset:', wrapperOffset);

  // Phase 1 (Progress ~0.1)
  await page.evaluate((y) => window.scrollTo(0, y + 100), wrapperOffset);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'phase1_rendered.png' });

  // Phase 2 (Progress ~0.35)
  await page.evaluate((y) => window.scrollTo(0, y + 800), wrapperOffset);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'phase2_rendered.png' });

  // Phase 3 (Progress ~0.6)
  await page.evaluate((y) => window.scrollTo(0, y + 1500), wrapperOffset);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'phase3_rendered.png' });

  // Phase 4 (Progress ~0.85)
  await page.evaluate((y) => window.scrollTo(0, y + 2200), wrapperOffset);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'phase4_rendered.png' });

  await browser.close();
  console.log('All 4 phases captured successfully!');
}

capturePhases().catch(console.error);
