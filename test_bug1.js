import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testBug1() {
  console.log('=== STARTING TEST FOR BUG 1: Scene A Overlap, Trophy Opacity & Hero Hand-off ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const widths = [1366, 1440, 1920];
  let allPassed = true;

  for (const width of widths) {
    console.log(`\n--- Testing at viewport ${width}x900 ---`);
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900 });
    await page.goto('http://localhost:8080/home', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    // Scroll to holding range of Scene A (~1200px)
    await page.evaluate(() => window.scrollTo(0, 1200));
    await new Promise(r => setTimeout(r, 400));

    const layoutCheck = await page.evaluate(() => {
      const leftCol = document.querySelector('.scene-a-col-left');
      const centerCol = document.querySelector('.scene-a-col-center');
      const rightCol = document.querySelector('.scene-a-col-right');
      const card = document.querySelector('.scene-a-trophy-card');

      const leftRect = leftCol.getBoundingClientRect();
      const centerRect = centerCol.getBoundingClientRect();
      const rightRect = rightCol.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const cardOpacity = window.getComputedStyle(card).opacity;
      const cardBg = window.getComputedStyle(card).backgroundColor;

      const overlapLeftCenter = leftRect.right > cardRect.left;
      const overlapCenterRight = cardRect.right > rightRect.left;

      return {
        leftRight: leftRect.right,
        cardLeft: cardRect.left,
        cardRight: cardRect.right,
        rightLeft: rightRect.left,
        overlapLeftCenter,
        overlapCenterRight,
        cardOpacity: parseFloat(cardOpacity),
        cardBg
      };
    });

    console.log(`[${width}px] Left col right: ${layoutCheck.leftRight.toFixed(1)}px | Card left: ${layoutCheck.cardLeft.toFixed(1)}px | Gap: ${(layoutCheck.cardLeft - layoutCheck.leftRight).toFixed(1)}px`);
    console.log(`[${width}px] Card right: ${layoutCheck.cardRight.toFixed(1)}px | Right col left: ${layoutCheck.rightLeft.toFixed(1)}px | Gap: ${(layoutCheck.rightLeft - layoutCheck.cardRight).toFixed(1)}px`);
    console.log(`[${width}px] Card computed opacity: ${layoutCheck.cardOpacity}`);

    if (layoutCheck.overlapLeftCenter || layoutCheck.overlapCenterRight) {
      console.error(`FAIL at ${width}px: Overlap detected! Left-Center: ${layoutCheck.overlapLeftCenter}, Center-Right: ${layoutCheck.overlapCenterRight}`);
      allPassed = false;
    } else {
      console.log(`PASS at ${width}px: No overlap between text columns and center card!`);
    }

    if (layoutCheck.cardOpacity < 0.99) {
      console.error(`FAIL at ${width}px: Trophy card computed opacity is ${layoutCheck.cardOpacity}, expected 1.0!`);
      allPassed = false;
    } else {
      console.log(`PASS at ${width}px: Trophy card computed opacity is ${layoutCheck.cardOpacity} (crisp & solid)!`);
    }

    // 2. Check Hand-off: Hero text vs Scene A text never visible together
    console.log(`[${width}px] Testing scroll hand-off from Hero to Scene A...`);
    let handoffViolations = 0;

    for (let scrollY = 0; scrollY <= 1400; scrollY += 25) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await new Promise(r => setTimeout(r, 30));

      const visibility = await page.evaluate(() => {
        const heroH1 = document.querySelector('.scrolly-h1');
        const sceneAH2 = document.querySelector('.scene-a-headline');
        if (!heroH1 || !sceneAH2) return { heroVisible: false, sceneAVisible: false };

        const heroBox = heroH1.getBoundingClientRect();
        const sceneABox = sceneAH2.getBoundingClientRect();
        const vh = window.innerHeight;

        const heroInView = heroBox.bottom > 0 && heroBox.top < vh;
        const sceneAInView = sceneABox.bottom > 0 && sceneABox.top < vh;

        const heroBoxEl = heroH1.closest('.hero-content-box') || heroH1;
        const sceneABoxEl = sceneAH2.closest('.scene-a-grid') || sceneAH2;

        const heroOpacity = parseFloat(window.getComputedStyle(heroBoxEl).opacity);
        const sceneAOpacity = parseFloat(window.getComputedStyle(sceneABoxEl).opacity);

        const heroVisible = heroInView && heroOpacity > 0.05;
        const sceneAVisible = sceneAInView && sceneAOpacity > 0.05;

        return {
          heroVisible,
          sceneAVisible,
          heroOpacity,
          sceneAOpacity
        };
      });

      if (visibility.heroVisible && visibility.sceneAVisible) {
        console.error(`FAIL Hand-off at scrollY=${scrollY}: Hero (opacity ${visibility.heroOpacity}) and Scene A (opacity ${visibility.sceneAOpacity}) are both visible!`);
        handoffViolations++;
        allPassed = false;
      }
    }

    if (handoffViolations === 0) {
      console.log(`PASS at ${width}px: Hero and Scene A headlines are NEVER visible together during scroll!`);
    }

    await page.close();
  }

  await browser.close();

  if (allPassed) {
    console.log('\n========================================');
    console.log('✅ BUG 1 VERIFICATION: ALL TESTS PASSED!');
    console.log('========================================');
    process.exit(0);
  } else {
    console.error('\n❌ BUG 1 VERIFICATION FAILED.');
    process.exit(1);
  }
}

testBug1().catch((err) => {
  console.error(err);
  process.exit(1);
});
