const puppeteer = require('puppeteer');

async function preciseInspect() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const detailUrl = 'https://web.pcc.gov.tw/prkms/urlSelector/common/tpam?pk=NzExNDY0OTY=';
    console.log(`--- Visiting Detail: ${detailUrl} ---`);

    await page.goto(detailUrl, { waitUntil: 'networkidle2' });

    const extraction = await page.evaluate(() => {
        const data = [];
        const tables = Array.from(document.querySelectorAll('table'));
        tables.forEach((table, tIndex) => {
            const rows = Array.from(table.rows);
            rows.forEach((row, rIndex) => {
                const cells = Array.from(row.cells).map(c => c.innerText.trim());
                data.push({ table: tIndex, row: rIndex, content: cells });
            });
        });
        return data;
    });

    console.log('Table Content:', JSON.stringify(extraction, null, 2));

    await browser.close();
}

preciseInspect();
