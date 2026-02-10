const puppeteer = require('puppeteer');

async function clickInspect() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('--- Searching PCC ---');
    await page.goto('https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?tenderName=%E7%92%B0%E5%A2%83%E6%95%99%E8%82%B2&dateType=isSpdt', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('table.tb_01', { timeout: 10000 });

    console.log('--- Clicking first tender ---');
    await Promise.all([
        page.click('table.tb_01 a'),
        page.waitForNavigation({ waitUntil: 'domcontentloaded' })
    ]);

    const data = await page.evaluate(() => {
        const results = {};
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

    console.log('PCC Detail Data:', JSON.stringify(data, null, 2));

    console.log('\n--- Checking TaiwanBuying Detail ---');
    await page.goto('https://www.taiwanbuying.com.tw/ShowDetail.ASP?RecNo=4685226', { waitUntil: 'domcontentloaded' });
    const tbData = await page.evaluate(() => {
        const results = {};
        const rows = Array.from(document.querySelectorAll('tr'));
        rows.forEach(tr => {
            const tds = Array.from(tr.querySelectorAll('td'));
            if (tds.length >= 2) {
                const key = tds[0].innerText.trim();
                const val = tds[1].innerText.trim();
                if (key.includes('預算金額')) results.budget = val;
                if (key.includes('開標日期')) results.openDate = val;
                if (key.includes('公告日期')) results.publish = val;
                if (key.includes('開標地點')) results.location = val;
            }
        });
        return results;
    });
    console.log('TB Detail Data:', JSON.stringify(tbData, null, 2));

    await browser.close();
}

clickInspect();
