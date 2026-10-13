const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureLive() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8080/home', { waitUntil: 'networkidle2' });

  // 1. Light Mode Header
  const nav = await page.$('nav');
  if (nav) {
    await nav.screenshot({ path: 'live_nav_light.png' });
    console.log('Saved live_nav_light.png');
  }

  // 2. Toggle to Dark Mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise(r => setTimeout(r, 400));
  if (nav) {
    await nav.screenshot({ path: 'live_nav_dark.png' });
    console.log('Saved live_nav_dark.png');
  }

  // 3. Footer screenshot
  const footer = await page.$('footer');
  if (footer) {
    await footer.screenshot({ path: 'live_footer.png' });
    console.log('Saved live_footer.png');
  }

  await browser.close();
}

captureLive().catch(err => {
  console.error(err);
  process.exit(1);
});
