const puppeteer = require('puppeteer');
const fs = require('fs');

async function dumpPCCSearch() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const searchUrl = 'https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?tenderName=%E7%92%B0%E5%A2%83%E6%95%99%E8%82%B2&dateType=isSpdt';

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table.tb_01');
    const content = await page.content();
    fs.writeFileSync('pcc_search_test.html', content);
    console.log('Search HTML dumped to pcc_search_test.html');

    await browser.close();
}

dumpPCCSearch();
