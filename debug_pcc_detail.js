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
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Target project 115AA021
    const url = 'https://web.pcc.gov.tw/prkms/urlSelector/common/tpam?pk=NzExNDQ0OTI=';
    console.log(`Navigating to ${url}`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const content = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr')).map(tr => {
            const th = tr.querySelector('th');
            const td = tr.querySelector('td');
            return {
                th: th ? th.innerText.trim() : null,
                td: td ? td.innerText.trim() : null
            };
        }).filter(r => r.th || r.td);

        return {
            title: document.title,
            rows: rows,
            text: document.body.innerText.substring(0, 1000)
        };
    });

    console.log('Title:', content.title);
    if (content.text.includes('blocked') || content.text.includes('B區')) {
        console.log('BLOCKED BY ANTI-BOT');
    } else {
        console.log('--- ALL LABELS ---');
        content.rows.forEach(r => {
            console.log(`${r.th}: ${r.td}`);
        });
    }

    await browser.close();
}

debug();
