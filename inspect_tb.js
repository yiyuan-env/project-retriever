const puppeteer = require('puppeteer');

async function inspectTB() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    console.log('--- Inspecting TaiwanBuying ---');
    await page.goto('https://www.taiwanbuying.com.tw/Query_Keyword.ASP', { waitUntil: 'domcontentloaded' });
    await page.type('input[name="keyword"]', '環境教育');
    await Promise.all([
        page.click('input[type="submit"][value="查詢"]'),
        page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    ]);

    const structure = await page.evaluate(() => {
        // Find the main table containing the strings
        const tables = Array.from(document.querySelectorAll('table'));
        const resultTable = tables.find(t => t.innerText.includes('查詢到以下採購資訊'));
        if (!resultTable) return "Table not found";

        const rows = Array.from(resultTable.querySelectorAll('tr'));
        return rows.slice(0, 5).map(tr => {
            return Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
        });
    });
    console.log('TB Structure:', JSON.stringify(structure, null, 2));

    await browser.close();
}

inspectTB();
