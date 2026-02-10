const puppeteer = require('puppeteer');

async function inspectTables() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    console.log('--- Inspecting PCC ---');
    await page.goto('https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?tenderName=%E7%92%B0%E5%A2%83%E6%95%99%E8%82%B2&dateType=isSpdt', { waitUntil: 'domcontentloaded' });
    const pccHeaders = await page.evaluate(() => {
        const ths = Array.from(document.querySelectorAll('table.tb_01 th'));
        return ths.map(th => th.innerText.trim());
    });
    console.log('PCC Headers:', pccHeaders);
    const pccRow = await page.evaluate(() => {
        const tr = document.querySelector('table.tb_01 tr:nth-child(2)'); // First data row
        if (!tr) return null;
        return Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
    });
    console.log('PCC Row 1:', pccRow);

    console.log('\n--- Inspecting TaiwanBuying ---');
    await page.goto('https://www.taiwanbuying.com.tw/Query_Keyword.ASP', { waitUntil: 'domcontentloaded' });
    await page.type('input[name="keyword"]', '環境教育');
    await Promise.all([
        page.click('input[type="submit"][value="查詢"]'),
        page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    ]);
    const tbRow = await page.evaluate(() => {
        const tr = document.querySelector('table[width="100%"] tr:nth-child(2)'); // TaiwanBuying table structure is messy
        if (!tr) return null;
        return Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
    });
    console.log('TB Row 1:', tbRow);

    // Let's also look for headers in TB
    const tbHeaders = await page.evaluate(() => {
        const tr = document.querySelector('table tr[bgcolor="#CCCCCC"]'); // Likely header row
        if (!tr) return null;
        return Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
    });
    console.log('TB Headers:', tbHeaders);

    await browser.close();
}

inspectTables();
