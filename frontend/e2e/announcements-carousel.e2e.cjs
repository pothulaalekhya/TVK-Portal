const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testAnnouncementCarousel() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:8080/home', { waitUntil: 'networkidle2' });

  // 1. Capture initial announcement strip
  const strip = await page.$('.bg-slate-900.text-slate-300');
  if (strip) {
    await strip.screenshot({ path: 'announcement_slide_1.png' });
    console.log('Saved announcement_slide_1.png');
  }

  // 2. Wait for auto-cycle (3.8s timer)
  console.log('Waiting 4.2s for auto-cycle transition...');
  await new Promise(r => setTimeout(r, 4200));

  if (strip) {
    await strip.screenshot({ path: 'announcement_slide_2.png' });
    console.log('Saved announcement_slide_2.png');
  }

  // 3. Test manual next button click
  const nextBtn = await page.$('button[title="Next Announcement"]');
  if (nextBtn) {
    await nextBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await strip.screenshot({ path: 'announcement_slide_3.png' });
    console.log('Saved announcement_slide_3.png (after manual next click)');
  }

  // Check texts
  const announcements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.site-container .truncate')).map(el => el.textContent.trim());
  });
  console.log('Found announcements in DOM:', announcements);

  await browser.close();
}

testAnnouncementCarousel().catch(err => {
  console.error(err);
  process.exit(1);
});
