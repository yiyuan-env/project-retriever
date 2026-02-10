const puppeteer = require('puppeteer');

async function sessionInspect() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('--- Step 1: Establish Session via Search ---');
    await page.goto('https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?tenderName=%E7%92%B0%E5%A2%83%E6%95%99%E8%82%B2&dateType=isSpdt', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('table.tb_01', { timeout: 10000 });
    const detailLink = await page.evaluate(() => {
        const link = document.querySelector('table.tb_01 a');
        return link ? link.href : null;
    });

    if (!detailLink) {
        console.log('No detail link found in search.');
        await browser.close();
        return;
    }

    console.log(`--- Step 2: Visit Detail Page: ${detailLink} ---`);
    await page.goto(detailLink, { waitUntil: 'domcontentloaded' });

    // Check if we are blocked again
    const isBlocked = await page.evaluate(() => document.body.innerText.includes('Web Page Blocked'));
    if (isBlocked) {
        console.log('Still blocked by WAF on detail page even with session.');
    } else {
        console.log('Succesfully reached detail page!');
        const data = await page.evaluate(() => {
            const results = {};
            const ths = Array.from(document.querySelectorAll('th'));
            const tds = Array.from(document.querySelectorAll('td'));

            // Map rows based on nearby TH
            const rows = Array.from(document.querySelectorAll('tr'));
            rows.forEach(tr => {
                const th = tr.querySelector('th');
                const td = tr.querySelector('td');
                if (th && td) {
                    const key = th.innerText.trim();
                    const val = td.innerText.trim();
                    if (key.includes('預算金額')) results.budget = val;
                    if (key.includes('預計金額')) results.expected = val;
                    if (key.includes('開標地點')) results.location = val;
                    if (key.includes('公告日')) results.publish = val;
                    if (key.includes('開標日期')) results.openDate = val;
                }
            });
            return results;
        });
        console.log('Extracted Data:', JSON.stringify(data, null, 2));
    }

    await browser.close();
}

sessionInspect();
