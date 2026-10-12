import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureScrolledFooter() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8080/home', { waitUntil: 'networkidle2' });

  await page.evaluate(() => {
    window.scrollTo(0, 20000);
    document.querySelectorAll('.motion-reveal, [motionReveal]').forEach(el => {
      el.classList.add('is-revealed');
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.visibility = 'visible';
    });
  });
  await new Promise(r => setTimeout(r, 600));

  const footer = await page.$('footer');
  if (footer) {
    await footer.screenshot({ path: 'live_footer_revealed.png' });
    console.log('Saved live_footer_revealed.png');
  }

  await browser.close();
}

captureScrolledFooter().catch(err => {
  console.error(err);
  process.exit(1);
});
