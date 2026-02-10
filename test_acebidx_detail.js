const puppeteer = require('puppeteer');

async function getAcebidxDetail(projectName) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Trying a more standard search path
    const searchUrl = `https://acebidx.com/zh-TW/tenders?q=${encodeURIComponent(projectName)}`;
    console.log(`Searching Acebidx for: ${projectName}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        // Find the first relevant result
        const card = document.querySelector('.tender-card, .search-result-item, tr'); // Generic
        if (!card) return null;

        const text = card.innerText;
        const res = {};

        // Extract budget (usually looks like $XXX,XXX)
        const budgetMatch = text.match(/\$[\d,]+/);
        if (budgetMatch) res.budget = budgetMatch[0];

        // Dates
        const dates = text.match(/\d{4}\/\d{2}\/\d{2}/g);
        if (dates) {
            res.publishDate = dates[0];
            res.openDate = dates[1] || dates[0];
        }

        return res;
    });

    console.log('Extracted Data:', data);
    await browser.close();
    return data;
}

getAcebidxDetail('115環境教育資訊系統功能整合及環境教育推動工作計畫');
