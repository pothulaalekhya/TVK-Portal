const puppeteer = require('puppeteer-core');

async function captureHero() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:4200/home', { waitUntil: 'networkidle2' });

  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'hero_animated_cluster.png' });

  await browser.close();
  console.log('Hero screenshot captured!');
}

captureHero().catch(console.error);
