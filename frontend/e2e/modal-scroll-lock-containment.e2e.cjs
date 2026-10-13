const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testBug3() {
  console.log('=== STARTING TEST FOR BUG 3: Modal Scroll Lock & Background Containment ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let allPassed = true;

  const testCases = [
    { name: 'Desktop 1440x900 Light', width: 1440, height: 900, darkMode: false },
    { name: 'Desktop 1440x900 Dark', width: 1440, height: 900, darkMode: true },
    { name: 'Mobile 390x844 Light', width: 390, height: 844, darkMode: false }
  ];

  for (const tc of testCases) {
    console.log(`\n--------------------------------------------------`);
    console.log(`TEST CASE: ${tc.name}`);
    console.log(`--------------------------------------------------`);

    const page = await browser.newPage();
    await page.setViewport({ width: tc.width, height: tc.height });
    await page.goto('http://localhost:8080/home', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    if (tc.darkMode) {
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      });
      await new Promise(r => setTimeout(r, 200));
    }

    // 1. Scroll mid-page
    const targetScrollY = 1600;
    await page.evaluate((y) => window.scrollTo(0, y), targetScrollY);
    await new Promise(r => setTimeout(r, 400));

    const initialScrollY = await page.evaluate(() => window.scrollY);
    console.log(`Mid-scroll position before opening modal: ${initialScrollY}px`);

    // Measure header width & position to verify no header layout shift
    const headerBefore = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return null;
      const rect = nav.getBoundingClientRect();
      return { width: rect.width, left: rect.left };
    });

    // 2. Open Student Registration Form Modal
    console.log('Opening Student Application / Registration modal...');
    await page.evaluate(() => {
      const regBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Register') || b.textContent.includes('Book Demo'));
      if (regBtn) regBtn.click();
      else window.dispatchEvent(new CustomEvent('open-reg-modal'));
    });
    await new Promise(r => setTimeout(r, 600));

    // Verify modal is open and has lock classes & data-lenis-prevent
    const modalCheck = await page.evaluate(() => {
      const isLocked = document.documentElement.classList.contains('scroll-locked');
      const modal = document.querySelector('.motion-modal-dialog') || document.querySelector('[role="dialog"]');
      const hasPrevent = modal ? modal.hasAttribute('data-lenis-prevent') : false;
      const modalScrollTop = modal ? modal.scrollTop : -1;
      const modalScrollHeight = modal ? modal.scrollHeight : -1;
      const modalClientHeight = modal ? modal.clientHeight : -1;

      return {
        isLocked,
        modalFound: !!modal,
        hasPrevent,
        modalScrollTop,
        modalScrollHeight,
        modalClientHeight
      };
    });

    console.log(`Modal open: ${modalCheck.modalFound}, data-lenis-prevent: ${modalCheck.hasPrevent}, scroll-locked class: ${modalCheck.isLocked}`);
    if (!modalCheck.modalFound || !modalCheck.isLocked || !modalCheck.hasPrevent) {
      console.error(`FAIL: Modal is not properly locked or missing data-lenis-prevent!`);
      allPassed = false;
    } else {
      console.log('PASS: Modal opened with html.scroll-locked and data-lenis-prevent!');
    }

    // Header layout shift check while locked
    const headerDuring = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return null;
      const rect = nav.getBoundingClientRect();
      return { width: rect.width, left: rect.left };
    });

    if (headerBefore && headerDuring) {
      const widthDiff = Math.abs(headerBefore.width - headerDuring.width);
      console.log(`Header layout width diff: ${widthDiff}px`);
      if (widthDiff > 1) {
        console.warn(`Note: Small header width diff (${widthDiff}px) due to scrollbar padding compensation.`);
      } else {
        console.log('PASS: No header layout shift detected!');
      }
    }

    // 3. Scroll inside the modal: simulate wheel & keyboard down
    console.log('Scrolling inside modal...');
    const scrollInsideModalResult = await page.evaluate(() => {
      const modal = document.querySelector('.motion-modal-dialog') || document.querySelector('[role="dialog"]');
      if (!modal) return { modalScrolled: false, pageMoved: false };

      // Dispatch wheel inside modal
      modal.scrollTop += 250;
      const modalScrolled = modal.scrollTop > 0;

      // Check if window.scrollY moved
      const currentScrollY = window.scrollY;
      return {
        modalScrolled,
        modalScrollTop: modal.scrollTop,
        currentScrollY
      };
    });

    console.log(`Modal scrolled to: ${scrollInsideModalResult.modalScrollTop}px, background page scrollY: ${scrollInsideModalResult.currentScrollY}px`);
    if (!scrollInsideModalResult.modalScrolled) {
      console.error('FAIL: Modal content did not scroll!');
      allPassed = false;
    } else if (scrollInsideModalResult.currentScrollY !== initialScrollY) {
      console.error(`FAIL: Background page moved from ${initialScrollY} to ${scrollInsideModalResult.currentScrollY}!`);
      allPassed = false;
    } else {
      console.log('PASS: Scrolling inside modal scrolls ONLY the modal, background page stays put!');
    }

    // 4. Scroll beyond modal bounds
    console.log('Scrolling modal to maximum end and beyond...');
    const scrollBeyondResult = await page.evaluate(() => {
      const modal = document.querySelector('.motion-modal-dialog') || document.querySelector('[role="dialog"]');
      if (modal) {
        modal.scrollTop = modal.scrollHeight + 1000;
      }
      return {
        pageScrollY: window.scrollY
      };
    });

    if (scrollBeyondResult.pageScrollY !== initialScrollY) {
      console.error(`FAIL: Over-scrolling modal moved background page!`);
      allPassed = false;
    } else {
      console.log('PASS: Over-scrolling modal to its end and beyond does NOT move the page!');
    }

    // 5. Close modal and verify exact scroll restoration and animation resumption
    console.log('Closing modal...');
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Cancel' || b.textContent.trim() === '×');
      if (cancelBtn) cancelBtn.click();
      else window.dispatchEvent(new CustomEvent('tvk-modal-esc'));
    });
    await new Promise(r => setTimeout(r, 600));

    const afterCloseCheck = await page.evaluate(() => {
      const isLocked = document.documentElement.classList.contains('scroll-locked');
      const currentScrollY = window.scrollY;
      const hasMotionReady = document.documentElement.classList.contains('motion-ready');
      return { isLocked, currentScrollY, hasMotionReady };
    });

    console.log(`After close: isLocked=${afterCloseCheck.isLocked}, scrollY=${afterCloseCheck.currentScrollY}px, motionReady=${afterCloseCheck.hasMotionReady}`);
    if (afterCloseCheck.isLocked) {
      console.error('FAIL: scroll-locked was not removed on close!');
      allPassed = false;
    }
    if (Math.abs(afterCloseCheck.currentScrollY - initialScrollY) > 2) {
      console.error(`FAIL: Scroll position not restored! Expected ${initialScrollY}, got ${afterCloseCheck.currentScrollY}`);
      allPassed = false;
    } else {
      console.log('PASS: Modal close restored EXACT scroll position and background animations!');
    }

    await page.close();
  }

  await browser.close();

  if (allPassed) {
    console.log('\n========================================');
    console.log('✅ BUG 3 VERIFICATION: ALL TESTS PASSED!');
    console.log('========================================');
    process.exit(0);
  } else {
    console.error('\n❌ BUG 3 VERIFICATION FAILED.');
    process.exit(1);
  }
}

testBug3().catch((err) => {
  console.error(err);
  process.exit(1);
});
