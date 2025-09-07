
const puppeteer = require('puppeteer');

async function captureTabletScreenshots() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set tablet viewport
  await page.setViewport({
    width: 1080,
    height: 1920, // 16:9 aspect ratio
    deviceScaleFactor: 1,
  });
  
  // Navigate to your app
  await page.goto('https://ee2f5811-628a-444d-b83f-2bffaa9c3561-00-3d22d0btftv4b.janeway.replit.dev');
  
  // Wait for content to load
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({
    path: 'tablet-screenshot-1.png',
    type: 'png',
    fullPage: false
  });
  
  // Navigate to other pages and capture more screenshots
  await page.goto('https://ee2f5811-628a-444d-b83f-2bffaa9c3561-00-3d22d0btftv4b.janeway.replit.dev/jobs');
  await page.waitForTimeout(3000);
  await page.screenshot({
    path: 'tablet-screenshot-2.png',
    type: 'png',
    fullPage: false
  });
  
  await browser.close();
}

captureTabletScreenshots().catch(console.error);
