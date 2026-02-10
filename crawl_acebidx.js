const puppeteer = require('puppeteer');

async function crawlAcebidx(keyword) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log(`Searching Acebidx for: ${keyword}`);

    // Attempt search via query param
    const searchUrl = `https://acebidx.com/zh-TW/tenders?search=${encodeURIComponent(keyword)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    const results = await page.evaluate(() => {
        const items = [];
        // Look for tender titles and amounts
        const rows = Array.from(document.querySelectorAll('a[href*="/tenders/"]')).map(a => {
            const row = a.closest('tr') || a.parentElement.parentElement;
            return {
                title: a.innerText.trim(),
                url: a.href,
                fullText: row ? row.innerText : ''
            };
        });
        return rows;
    });

    console.log('Results Found:', results.length);
    if (results.length > 0) {
        console.log('First result:', JSON.stringify(results[0], null, 2));
    }

    await browser.close();
}

crawlAcebidx('環境教育');
