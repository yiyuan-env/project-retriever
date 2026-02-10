const puppeteer = require('puppeteer');
const fs = require('fs');

async function dumpPCCDetail() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const detailUrl = 'https://web.pcc.gov.tw/prkms/urlSelector/common/tpam?pk=NzExNDQ0OTI=';

    await page.goto(detailUrl, { waitUntil: 'networkidle2' });
    const content = await page.content();
    fs.writeFileSync('pcc_detail_test.html', content);
    console.log('HTML dumped to pcc_detail_test.html');

    await browser.close();
}

dumpPCCDetail();
