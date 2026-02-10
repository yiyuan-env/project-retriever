const puppeteer = require('puppeteer');

async function inspectPCCDetail() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Example detail URL from a common search
    const detailUrl = 'https://web.pcc.gov.tw/prkms/urlSelector/common/tpam?pk=NzExNDQ0OTI=';

    console.log(`--- Inspecting PCC Detail: ${detailUrl} ---`);
    await page.goto(detailUrl, { waitUntil: 'domcontentloaded' });

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

    console.log('Extracted Data:', JSON.stringify(data, null, 2));

    await browser.close();
}

inspectPCCDetail();
