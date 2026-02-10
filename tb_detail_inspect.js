const puppeteer = require('puppeteer');
const fs = require('fs');

async function tbInspect() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const detailUrl = 'https://www.taiwanbuying.com.tw/ShowDetail.ASP?RecNo=4685226';
    console.log(`--- Visiting TB Detail: ${detailUrl} ---`);

    await page.goto(detailUrl, { waitUntil: 'domcontentloaded' });

    const text = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync('tb_detail.txt', text);
    console.log('TB Detail text saved to tb_detail.txt');

    await browser.close();
}

tbInspect();
