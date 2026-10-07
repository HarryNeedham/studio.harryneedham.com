// Render landing-page/banner-soulmate.html as a 1672x941 PNG using Puppeteer + system Chrome.
// Output: landing-page/banner-soulmate.png
// Usage: node landing-page/build-banner.js

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const HTML = path.join(DIR, 'banner-soulmate.html');
const OUT  = path.join(DIR, 'banner-soulmate.png');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const W = 1672;
const H = 941;
// 2.3x device-scale factor renders the 1672×941 CSS canvas at ~3846×2164 output pixels — 4K-tier resolution.
const SCALE = 2.3;

(async () => {
  if (!fs.existsSync(HTML)) {
    console.error(`HTML not found: ${HTML}`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
    defaultViewport: { width: W, height: H, deviceScaleFactor: SCALE },
  });
  const page = await browser.newPage();

  await page.goto('file://' + HTML.replace(/ /g, '%20'), { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 500)); // let web fonts settle

  await page.screenshot({
    path: OUT,
    type: 'png',
    clip: { x: 0, y: 0, width: W, height: H },
    omitBackground: false,
  });

  await browser.close();

  const size = fs.statSync(OUT).size;
  console.log(`PNG written to: ${OUT}`);
  console.log(`Size: ${(size / 1024).toFixed(1)} KB`);
})();
