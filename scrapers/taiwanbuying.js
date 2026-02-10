const puppeteer = require('puppeteer');
const { isFutureOrToday } = require('../utils/date_helper');

async function scrapeTaiwanBuying(keywords) {
    console.log('Starting TaiwanBuying scraper with detail extraction...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });
    const page = await browser.newPage();
    const allResults = [];

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        for (const keyword of keywords) {
            console.log(`TaiwanBuying: Searching for "${keyword}"...`);
            await page.goto('https://www.taiwanbuying.com.tw/Query_Keyword.ASP', { waitUntil: 'domcontentloaded' });

            await page.waitForSelector('input[name="keyword"]');
            await page.type('input[name="keyword"]', keyword);

            await Promise.all([
                page.click('input[type="submit"][value="查詢"]'),
                page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            ]);

            const resultsFound = await page.evaluate(() => {
                return document.body.innerText.includes('查詢到以下採購資訊');
            });

            if (!resultsFound) continue;

            const pageResults = await page.evaluate(() => {
                const items = [];
                const links = Array.from(document.querySelectorAll('a[href^="javascript:openWin"]'));

                links.forEach(link => {
                    const fullText = link.innerText.trim();
                    const href = link.getAttribute('href');

                    const recNoMatch = href.match(/RecNo=(\d+)/);
                    if (recNoMatch) {
                        const recNo = recNoMatch[1];
                        const url = `https://www.taiwanbuying.com.tw/ShowDetail.ASP?RecNo=${recNo}`;

                        let agency = '';
                        let title = fullText;
                        if (fullText.includes(':')) {
                            const parts = fullText.split(':');
                            agency = parts[0].trim();
                            title = parts.slice(1).join(':').trim();
                        }

                        let dateText = 'Unknown Date';
                        const titleAttr = link.getAttribute('title') || '';
                        const dateMatch = titleAttr.match(/(\d{3,4}\/\d{1,2}\/\d{1,2})/);
                        if (dateMatch) {
                            dateText = dateMatch[1];
                        }

                        items.push({
                            agency,
                            title,
                            url,
                            endDate: dateText, // Initially using the date from list
                            source: 'TaiwanBuying'
                        });
                    }
                });
                return items;
            });

            const activeMatches = pageResults.filter(item => {
                const isFuture = isFutureOrToday(item.endDate);
                if (!isFuture) {
                    console.log(`TaiwanBuying: Skipping expired project: ${item.title} (Deadline: ${item.endDate})`);
                }
                return isFuture;
            });
            console.log(`TaiwanBuying: Found ${activeMatches.length} active matches for "${keyword}". Fetching details...`);

            const finalMatches = [];
            for (const item of activeMatches) {
                try {
                    await page.goto(item.url, { waitUntil: 'domcontentloaded' });
                    const details = await page.evaluate(() => {
                        const res = { budget: '', publishDate: '', openDate: '', location: '' };
                        const rows = Array.from(document.querySelectorAll('tr'));
                        rows.forEach(tr => {
                            const tds = Array.from(tr.querySelectorAll('td'));
                            if (tds.length >= 2) {
                                const key = tds[0].innerText.trim();
                                const val = tds[1].innerText.trim();
                                if (key.includes('預算金額')) res.budget = val;
                                if (key.includes('公告日期')) res.publishDate = val;
                                if (key.includes('開標日期')) res.openDate = val;
                                if (key.includes('開標地點')) res.location = val;
                            }
                        });
                        return res;
                    });

                    item.budget = details.budget;
                    item.publishDate = details.publishDate;
                    item.endDate = details.openDate || item.endDate;
                    item.location = details.location;

                    // Re-verify date after detail fetch to be strictly compliant
                    if (isFutureOrToday(item.endDate)) {
                        finalMatches.push(item);
                    } else {
                        console.log(`TaiwanBuying: Excluding newly discovered expired project: ${item.title} (Deadline: ${item.endDate})`);
                    }

                    await new Promise(r => setTimeout(r, 1200));
                } catch (e) {
                    console.log(`Failed TB detail for ${item.title}:`, e.message);
                }
            }

            allResults.push(...finalMatches);
            await new Promise(r => setTimeout(r, 1000));
        }

        const uniqueResults = [];
        const seenUrls = new Set();
        for (const item of allResults) {
            if (!seenUrls.has(item.url)) {
                seenUrls.add(item.url);
                uniqueResults.push(item);
            }
        }

        return uniqueResults;

    } catch (error) {
        console.error('TaiwanBuying error:', error);
        return [];
    } finally {
        await browser.close();
    }
}

module.exports = { scrapeTaiwanBuying };
