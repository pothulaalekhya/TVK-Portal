const { chromium } = require('playwright');

async function testBug1() {
  console.log('=== STARTING TEST FOR BUG 1: Scene A Overlap, Trophy Opacity & Hero Hand-off ===');
  const browser = await chromium.launch({ headless: true });
  const widths = [1366, 1440, 1920];
  let allPassed = true;

  for (const width of widths) {
    console.log(`\n--- Testing at viewport ${width}x900 ---`);
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 1. Check Scene A layout at holding position
    const wrapperA = await page.$('#wrapper-pill-roll');
    const wrapperBox = await wrapperA.boundingBox();
    const midScroll = wrapperBox.y + windowScrollY(page) + (wrapperBox.height * 0.5) - 450;
    
    // Scroll to holding range
    await page.evaluate((y) => window.scrollTo(0, y), 1200);
    await page.waitForTimeout(600);

    const layoutCheck = await page.evaluate(() => {
      const leftCol = document.querySelector('.scene-a-col-left');
      const centerCol = document.querySelector('.scene-a-col-center');
      const rightCol = document.querySelector('.scene-a-col-right');
      const card = document.querySelector('.scene-a-trophy-card');
      const headline = document.querySelector('.scene-a-headline');

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

    for (let scrollY = 0; scrollY <= 1500; scrollY += 30) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(50);

      const visibility = await page.evaluate(() => {
        const heroH1 = document.querySelector('.scrolly-h1');
        const sceneAH2 = document.querySelector('.scene-a-headline');
        if (!heroH1 || !sceneAH2) return { heroVis: false, sceneAVis: false };

        const heroBox = heroH1.getBoundingClientRect();
        const sceneABox = sceneAH2.getBoundingClientRect();
        const vh = window.innerHeight;

        const heroInView = heroBox.bottom > 0 && heroBox.top < vh;
        const sceneAInView = sceneABox.bottom > 0 && sceneABox.top < vh;

        const heroOpacity = parseFloat(window.getComputedStyle(heroH1.closest('.hero-content-box') || heroH1).opacity);
        const sceneAOpacity = parseFloat(window.getComputedStyle(sceneAH2.closest('.scene-a-grid') || sceneAH2).opacity);

        const heroVisible = heroInView && heroOpacity > 0.08;
        const sceneAVisible = sceneAInView && sceneAOpacity > 0.08;

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

function windowScrollY(page) {
  return 0;
}

testBug1().catch((err) => {
  console.error(err);
  process.exit(1);
});
