const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testMarquee() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8080/home', { waitUntil: 'networkidle2' });

  // 1. Capture top strip at t=0
  const strip = await page.$('.bg-slate-900.text-slate-300');
  if (strip) {
    await strip.screenshot({ path: 'live_marquee_t0.png' });
    console.log('Saved live_marquee_t0.png');
  }

  // 2. Wait 3 seconds to let marquee scroll smoothly
  await new Promise(r => setTimeout(r, 3000));
  if (strip) {
    await strip.screenshot({ path: 'live_marquee_t3.png' });
    console.log('Saved live_marquee_t3.png');
  }

  // 3. Test hover pausing
  const track = await page.$('.announcement-marquee-track');
  if (track) {
    const box = await track.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 200, box.y + 10);
      const playState = await page.evaluate(() => {
        const el = document.querySelector('.announcement-marquee-track');
        return window.getComputedStyle(el).animationPlayState;
      });
      console.log('Animation play state on hover:', playState);
    }
  }

  await browser.close();
}

testMarquee().catch(err => {
  console.error(err);
  process.exit(1);
});
