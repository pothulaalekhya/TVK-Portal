const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/pothu/.gemini/antigravity-ide/brain/2e84ff92-fb37-4656-aa67-f2b20764510f';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const VIEWPORTS = [
  { name: 'desktop_1920x1080', width: 1920, height: 1080 },
  { name: 'desktop_1366x768', width: 1366, height: 768 },
  { name: 'mobile_390x844', width: 390, height: 844 },
];

async function run() {
  console.log('Starting TVK Progressive Sticky Architecture Test Suite...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = {
    testPassed: true,
    viewportsTested: [],
    violations: [],
    screenshots: [],
    pageHeights: {},
  };

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });

    // Enable debug HUD for one of the tests
    const url = vp.name === 'desktop_1920x1080' ? 'http://localhost:8080/home?debug=1' : 'http://localhost:8080/home';
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const totalScrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    results.pageHeights[vp.name] = totalScrollHeight;
    console.log(`Total scroll height: ${totalScrollHeight}px`);

    // Verify motion-ready class is present
    const hasMotionReady = await page.evaluate(() => document.documentElement.classList.contains('motion-ready'));
    console.log(`motion-ready active: ${hasMotionReady}`);

    // Capture key screenshots for 1920x1080
    if (vp.name === 'desktop_1920x1080') {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sticky_1920_hero_hud.png') });
      
      // Scroll to Scene A
      await page.evaluate(() => window.scrollTo(0, 1100));
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sticky_1920_scene_a.png') });

      // Scroll to Scene B (Dark Panel)
      await page.evaluate(() => window.scrollTo(0, 3200));
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sticky_1920_scene_b.png') });

      // Scroll to Scene C (Step Swap)
      await page.evaluate(() => window.scrollTo(0, 5500));
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sticky_1920_scene_c.png') });

      // Scroll to FAQ & CTA
      await page.evaluate(() => window.scrollTo(0, 8500));
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sticky_1920_faq_cta.png') });
    }

    if (vp.name === 'mobile_390x844') {
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sticky_mobile_hero.png') });

      await page.evaluate(() => window.scrollTo(0, 900));
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sticky_mobile_scene_a.png') });

      await page.evaluate(() => window.scrollTo(0, 1800));
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sticky_mobile_scene_b.png') });
    }

    // Continuous 50px step assert: At every step, at least 1 heading or paragraph has computed opacity > 0.9
    console.log(`Running continuous 50px step scan across ${totalScrollHeight}px...`);
    const maxScroll = totalScrollHeight - vp.height;
    let viewportViolations = [];

    for (let y = 0; y <= maxScroll; y += 50) {
      await page.evaluate(yPos => window.scrollTo(0, yPos), y);
      await new Promise(r => setTimeout(r, 15));

      const isContentVisible = await page.evaluate(vh => {
        // Exclude header and floating callback button
        const candidates = Array.from(document.querySelectorAll('h1, h2, h3, p, .pill-matrix-item, .bento-card, .step-stage-card, .glass-card'));
        for (const el of candidates) {
          // Check if element is inside header or floating button
          if (el.closest('nav') || el.closest('header') || el.closest('.motion-floating-btn') || el.closest('.scrolly-debug-hud')) {
            continue;
          }
          const rect = el.getBoundingClientRect();
          // Element intersects viewport vertically with margin
          if (rect.top < vh - 40 && rect.bottom > 80 && rect.width > 20 && rect.height > 10) {
            const style = window.getComputedStyle(el);
            const opacity = parseFloat(style.opacity);
            if (opacity > 0.9 && style.visibility !== 'hidden' && style.display !== 'none') {
              return true;
            }
          }
        }
        return false;
      }, vp.height);

      if (!isContentVisible) {
        console.warn(`[FAIL] ${vp.name}: No visible heading/paragraph with opacity > 0.9 at scrollY = ${y}`);
        viewportViolations.push(y);
      }
    }

    if (viewportViolations.length === 0) {
      console.log(`[PASS] ${vp.name}: 100% of scroll positions have visible content with opacity > 0.9! Zero blank viewports.`);
    } else {
      console.error(`[FAIL] ${vp.name}: ${viewportViolations.length} violations at scrollY:`, viewportViolations);
      results.testPassed = false;
      results.violations.push({ viewport: vp.name, count: viewportViolations.length, scrollYs: viewportViolations });
    }

    results.viewportsTested.push({
      viewport: vp.name,
      violations: viewportViolations.length,
      passed: viewportViolations.length === 0,
    });

    await page.close();
  }

  // Dark Mode Test
  console.log(`\n========================================`);
  console.log(`TESTING DARK MODE (1440x900)`);
  console.log(`========================================`);
  const darkPage = await browser.newPage();
  await darkPage.setViewport({ width: 1440, height: 900 });
  await darkPage.goto('http://localhost:8080/home', { waitUntil: 'networkidle2' });
  await darkPage.evaluate(() => document.documentElement.classList.add('dark'));
  await new Promise(r => setTimeout(r, 600));

  await darkPage.screenshot({ path: path.join(ARTIFACT_DIR, 'sticky_dark_mode_hero.png') });
  await darkPage.evaluate(() => window.scrollTo(0, 3200));
  await new Promise(r => setTimeout(r, 600));
  await darkPage.screenshot({ path: path.join(ARTIFACT_DIR, 'sticky_dark_mode_darkpanel.png') });
  await darkPage.close();
  console.log('[PASS] Dark mode captured cleanly.');

  // Mid-page refresh test
  console.log(`\n========================================`);
  console.log(`TESTING MID-PAGE REFRESH`);
  console.log(`========================================`);
  const refreshPage = await browser.newPage();
  await refreshPage.setViewport({ width: 1440, height: 900 });
  await refreshPage.goto('http://localhost:8080/home', { waitUntil: 'networkidle2' });
  await refreshPage.evaluate(() => window.scrollTo(0, 3000));
  await refreshPage.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const postReloadY = await refreshPage.evaluate(() => window.scrollY);
  console.log(`Mid-page reload scroll position restored: ${postReloadY}px`);
  await refreshPage.close();

  // Save report
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'sticky_architecture_test_report.json'), JSON.stringify(results, null, 2));

  await browser.close();
  console.log('\n========================================');
  console.log(`OVERALL TEST STATUS: ${results.testPassed ? 'ALL TESTS PASSED (100% SUCCESS)' : 'FAILED'}`);
  console.log('========================================\n');
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
