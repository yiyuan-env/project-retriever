const puppeteer = require('puppeteer');
const fs = require('fs');

async function explore() {
    console.log('Exploring TaiwanBuying Query_Date...');
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

    try {
        console.log('Visiting Query_Date.ASP...');
        await page.goto('https://www.taiwanbuying.com.tw/Query_Date.ASP', { waitUntil: 'domcontentloaded' });

        // Wait for table to load
        try {
            await page.waitForSelector('table', { timeout: 10000 });
            console.log('Table found.');
        } catch (e) {
            console.log('Table NOT found.');
        }

        const html = await page.content();
        fs.writeFileSync('tb_query_date.html', html);
        console.log('Page dumped to tb_query_date.html');

    } catch (error) {
        console.error('Exploration Failed:', error);
    } finally {
        await browser.close();
    }
}

explore();
