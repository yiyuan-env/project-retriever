const puppeteer = require('puppeteer');
const fs = require('fs');

async function testSearch(keyword) {
    console.log(`Testing search for: ${keyword}`);
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
        await page.goto('https://www.taiwanbuying.com.tw/Query_Keyword.ASP', { waitUntil: 'domcontentloaded' });

        // Type into the first form's text input
        await page.type('input[name="keyword"]', keyword);
        await Promise.all([
            page.click('input[type="submit"][value="查詢"]'),
            page.waitForNavigation({ waitUntil: 'domcontentloaded' })
        ]);

        console.log('Search submitted.');
        const html = await page.content();
        fs.writeFileSync('tb_search_results.html', html);
        console.log('Results dumped to tb_search_results.html');

        const results = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).map(a => ({
                text: a.innerText.trim(),
                href: a.href
            })).filter(l => l.text.length > 5);
        });
        console.log(`Found ${results.length} links on result page.`);

    } catch (error) {
        console.error('Search Test Failed:', error);
    } finally {
        await browser.close();
    }
}

testSearch('環境');
