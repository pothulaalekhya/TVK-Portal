import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testBannerScroll() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8080/home', { waitUntil: 'networkidle2' });

  // Hover over the announcement strip (height 36px at top: 0 to 36)
  await page.mouse.move(500, 18);
  const scrollBefore = await page.evaluate(() => window.scrollY);
  
  // Wheel scroll
  await page.mouse.wheel({ deltaY: 300 });
  await new Promise(r => setTimeout(r, 400));
  const scrollAfter = await page.evaluate(() => window.scrollY);

  console.log(`Scroll before: ${scrollBefore}, Scroll after: ${scrollAfter}`);
  await browser.close();
}

testBannerScroll().catch(err => {
  console.error(err);
  process.exit(1);
});
