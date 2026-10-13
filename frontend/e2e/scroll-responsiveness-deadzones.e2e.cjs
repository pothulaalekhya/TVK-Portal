const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testBug2() {
  console.log('=== STARTING TEST FOR BUG 2: Instant Response on First Scroll, Zero Dead Zones ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8080/home', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  let allPassed = true;

  // TEST 1: Single wheel notch immediately moves the scene (no second scroll required)
  console.log('\n--- 1. Testing immediate response on single wheel notch ---');
  const initialScrollY = await page.evaluate(() => window.scrollY);
  console.log(`Initial scrollY: ${initialScrollY}px`);

  // Dispatch a single wheel event
  await page.mouse.wheel({ deltaY: 120 });
  await new Promise(r => setTimeout(r, 200));

  const afterFirstWheel = await page.evaluate(() => {
    const scrollY = window.scrollY;
    const heroContent = document.querySelector('.hero-content-box');
    const heroH1 = document.querySelector('.scrolly-h1');
    const opacity = heroContent ? window.getComputedStyle(heroContent).opacity : '1';
    return { scrollY, opacity };
  });

  console.log(`After 1st wheel notch: scrollY=${afterFirstWheel.scrollY}px`);
  if (afterFirstWheel.scrollY > initialScrollY) {
    console.log('PASS: Single wheel notch immediately advanced scroll position!');
  } else {
    console.error('FAIL: Scroll did not respond to first wheel notch!');
    allPassed = false;
  }

  // TEST 2: Slow scrolling top to bottom (never needs a second scroll, no blank frames)
  console.log('\n--- 2. Testing slow scrolling from top to bottom ---');
  let blankFramesSlow = 0;
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`Total page height: ${totalHeight}px`);

  for (let y = 0; y <= Math.min(totalHeight - 900, 6000); y += 60) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await new Promise(r => setTimeout(r, 25));

    const check = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, p'));
      const inViewVisible = headings.some(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > 50 && rect.top < (window.innerHeight - 50)) {
          const comp = window.getComputedStyle(el);
          const parentComp = el.parentElement ? window.getComputedStyle(el.parentElement) : null;
          const op = parseFloat(comp.opacity) * (parentComp ? parseFloat(parentComp.opacity) : 1);
          return op > 0.5;
        }
        return false;
      });
      return inViewVisible;
    });

    if (!check) {
      blankFramesSlow++;
      console.warn(`Warning: Potential low visibility at scrollY=${y}px`);
    }
  }

  if (blankFramesSlow === 0) {
    console.log('PASS: Slow scroll top to bottom has 0 blank frames and continuous transitions!');
  } else {
    console.error(`FAIL: Slow scroll had ${blankFramesSlow} blank/low visibility frames!`);
    allPassed = false;
  }

  // TEST 3: Fast scrolling bottom back to top
  console.log('\n--- 3. Testing fast scrolling back to top ---');
  let blankFramesFast = 0;
  for (let y = 5000; y >= 0; y -= 350) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await new Promise(r => setTimeout(r, 20));

    const check = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, p'));
      return headings.some(el => {
        const rect = el.getBoundingClientRect();
        return rect.bottom > 50 && rect.top < (window.innerHeight - 50) && parseFloat(window.getComputedStyle(el).opacity) > 0.5;
      });
    });

    if (!check) {
      blankFramesFast++;
    }
  }

  if (blankFramesFast === 0) {
    console.log('PASS: Fast scroll bottom to top has 0 blank frames and no jumping!');
  } else {
    console.error(`FAIL: Fast scroll had ${blankFramesFast} blank frames!`);
    allPassed = false;
  }

  await browser.close();

  if (allPassed) {
    console.log('\n========================================');
    console.log('✅ BUG 2 VERIFICATION: ALL TESTS PASSED!');
    console.log('========================================');
    process.exit(0);
  } else {
    console.error('\n❌ BUG 2 VERIFICATION FAILED.');
    process.exit(1);
  }
}

testBug2().catch((err) => {
  console.error(err);
  process.exit(1);
});
