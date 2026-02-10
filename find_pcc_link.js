const puppeteer = require('puppeteer');

async function findCorrectLink() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto('https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?tenderName=%E7%92%B0%E5%A2%83%E6%95%99%E8%82%B2&dateType=isSpdt', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('table.tb_01', { timeout: 10000 });

    const rowInfo = await page.evaluate(() => {
        const tr = document.querySelector('table.tb_01 tr:nth-child(2)'); // First data row
        if (!tr) return "Row not found";

        const links = Array.from(tr.querySelectorAll('a'));
        return links.map(a => ({
            text: a.innerText.trim(),
            href: a.href,
            ariaLabel: a.getAttribute('aria-label')
        }));
    });

    console.log('Row Links:', JSON.stringify(rowInfo, null, 2));

    await browser.close();
}

findCorrectLink();
