const { chromium } = require('C:/Users/1/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()}: ${r.url()}`);});
  await page.goto('http://127.0.0.1:8080/',{waitUntil:'networkidle'});
  await page.screenshot({path:'tmp/desktop.png',fullPage:true});
  await page.locator('[data-gallery]').first().click();
  if(!await page.locator('dialog').evaluate(e=>e.open))throw Error('Gallery did not open');
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:8080/',{waitUntil:'networkidle'});
  await page.locator('.menu-toggle').click();
  if(await page.locator('.menu-toggle').getAttribute('aria-expanded')!=='true')throw Error('Menu did not open');
  await page.locator('#navigation a[href="#construction"]').click();
  if(await page.locator('.menu-toggle').getAttribute('aria-expanded')!=='false')throw Error('Menu did not close');
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:'tmp/mobile.png',fullPage:true});
  for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:900});if(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth))throw Error(`Overflow at ${width}`);}
  if(errors.length)throw Error(errors.join('\n'));
  console.log('OK: desktop/mobile rendering, gallery, mobile menu, no overflow at 360/390/768/1440, no JS or HTTP errors.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
