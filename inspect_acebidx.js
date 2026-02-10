const puppeteer = require('puppeteer');

async function inspectAcebidx() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const keyword = '環境教育';

    console.log(`--- Searching Acebidx for: ${keyword} ---`);
    await page.goto(`https://acebidx.com/zh-TW/search?q=${encodeURIComponent(keyword)}`, { waitUntil: 'networkidle2' });

    const results = await page.evaluate(() => {
        const items = [];
        const cards = Array.from(document.querySelectorAll('.tender-card, .search-result-item, tr')); // Speculative

        // Let's dump the text of the first few elements to find the right selector
        return {
            bodyText: document.body.innerText.substring(0, 1000),
            htmlSample: document.body.innerHTML.substring(0, 1000)
        };
    });

    console.log('Sample Data:', results);

    await browser.close();
}

inspectAcebidx();
