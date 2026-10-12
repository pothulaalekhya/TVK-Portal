const puppeteer = require('puppeteer-core');

async function captureHeroDark() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:4200/home', { waitUntil: 'networkidle2' });

  // Toggle dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });

  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'hero_animated_cluster_dark.png' });

  await browser.close();
  console.log('Hero dark screenshot captured!');
}

captureHeroDark().catch(console.error);
