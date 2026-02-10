const puppeteer = require('puppeteer');

async function inspectLinks() {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto('https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic?tenderName=%E7%92%B0%E5%A2%83%E6%95%99%E8%82%B2&dateType=isSpdt', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('table.tb_01', { timeout: 10000 });

    const linkInfo = await page.evaluate(() => {
        const link = document.querySelector('table.tb_01 a');
        if (!link) return "No link found";
        return {
            href: link.href,
            onclick: link.getAttribute('onclick'),
            outerHTML: link.outerHTML
        };
    });

    console.log('Link Info:', JSON.stringify(linkInfo, null, 2));

    await browser.close();
}

inspectLinks();
