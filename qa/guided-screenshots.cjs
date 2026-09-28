const { chromium } = require('playwright');
const fs = require('fs');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});
 const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 for (const route of ['/demo','/demo/finance?mode=guided','/demo/inventory?mode=guided','/demo/procurement?mode=guided','/demo/operations?mode=guided']) {
  await p.goto('http://127.0.0.1:3000'+route,{waitUntil:'networkidle'});
  await p.screenshot({path:'qa/artifacts/guided-'+(route.split('/')[2]||'picker').split('?')[0]+'.png',fullPage:true});
 }
 await p.setViewportSize({width:390,height:844});
 await p.goto('http://127.0.0.1:3000/demo/finance?mode=guided',{waitUntil:'networkidle'});
 await p.screenshot({path:'qa/artifacts/guided-finance-mobile.png',fullPage:true});
 console.log(JSON.stringify({errors,overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
