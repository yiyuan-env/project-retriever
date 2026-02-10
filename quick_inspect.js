const puppeteer = require('puppeteer');

async function quickInspect() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('--- PCC Search ---');
    await page.goto('https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?tenderName=%E7%92%B0%E5%A2%83%E6%95%99%E8%82%B2&dateType=isSpdt', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table.tb_01');
    const pccText = await page.evaluate(() => {
        const row = document.querySelector('table.tb_01 tr:nth-child(2)');
        return row ? row.innerText : 'Row not found';
    });
    console.log('PCC Row Text:\n', pccText);

    console.log('\n--- TaiwanBuying Search ---');
    await page.goto('https://www.taiwanbuying.com.tw/Query_Keyword.ASP', { waitUntil: 'domcontentloaded' });
    await page.type('input[name="keyword"]', '環境教育');
    await Promise.all([
        page.click('input[type="submit"][value="查詢"]'),
        page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    ]);
    const tbText = await page.evaluate(() => {
        const row = document.querySelector('a[href^="javascript:openWin"]')?.closest('tr');
        return row ? row.innerText : 'Row not found';
    });
    console.log('TB Row Text:\n', tbText);

    await browser.close();
}

quickInspect();
