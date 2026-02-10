const puppeteer = require('puppeteer');
const fs = require('fs');

async function diagnostic() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('--- Step 1: Search ---');
    await page.goto('https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?tenderName=%E7%92%B0%E5%A2%83%E6%95%99%E8%82%B2&dateType=isSpdt', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('table.tb_01', { timeout: 10000 });
    const detailLink = await page.evaluate(() => document.querySelector('table.tb_01 a')?.href);

    if (!detailLink) {
        console.log('No results.');
        await browser.close();
        return;
    }

    console.log(`--- Step 2: Visit Detail: ${detailLink} ---`);
    await page.goto(detailLink, { waitUntil: 'networkidle2' });

    const pageText = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync('pcc_content.txt', pageText);

    const extraction = await page.evaluate(() => {
        const res = {};
        const allRows = Array.from(document.querySelectorAll('tr'));
        allRows.forEach(tr => {
            const text = tr.innerText;
            if (text.includes('預算金額')) res.budgetRow = text.replace(/\s+/g, ' ');
            if (text.includes('預計金額')) res.expectedRow = text.replace(/\s+/g, ' ');
            if (text.includes('開標地點')) res.locationRow = text.replace(/\s+/g, ' ');
        });
        return res;
    });

    console.log('Extraction Result:', JSON.stringify(extraction, null, 2));

    await browser.close();
}

diagnostic();
