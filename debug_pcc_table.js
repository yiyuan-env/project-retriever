const puppeteer = require('puppeteer');

async function debug() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    const url = 'https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?pageSize=&firstSearch=true&searchType=basic&level_1=on&isBinding=N&isLogIn=N&tenderName=%E7%92%B0%E5%A2%83%E6%95%99%E8%82%B2&tenderWay=TENDER_WAY_ALL_DECLARATION&dateType=isSpdt&tenderType=TENDER_DECLARATION';
    console.log(`Navigating to ${url}`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('table.tb_01', { timeout: 10000 });

    const rows = await page.evaluate(() => {
        const trs = Array.from(document.querySelectorAll('table.tb_01 tr'));
        return trs.map((tr, i) => {
            const tds = Array.from(tr.querySelectorAll('td, th')).map(td => ({
                text: td.innerText.trim(),
                html: td.innerHTML
            }));
            return { index: i, cells: tds };
        });
    });

    console.log('--- TABLE DUMP ---');
    rows.slice(0, 3).forEach(row => {
        console.log(`Row ${row.index}:`);
        row.cells.forEach((cell, ci) => {
            console.log(`  Col ${ci} [${cell.text}]: ${cell.html.substring(0, 100)}...`);
        });
    });

    await browser.close();
}

debug();
