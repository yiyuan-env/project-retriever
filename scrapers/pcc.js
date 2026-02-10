const puppeteer = require('puppeteer');
const { isFutureOrToday } = require('../utils/date_helper');

async function scrapePCC(keywords) {
    console.log('Starting PCC scraper with detail extraction...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });
    const page = await browser.newPage();
    const finalResults = [];

    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0'
    ];

    await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        for (const keyword of keywords) {
            console.log(`Searching PCC for: ${keyword}`);

            const baseUrl = 'https://web.pcc.gov.tw/prkms/tender/common/basic/readTenderBasic';
            const params = new URLSearchParams({
                pageSize: '',
                firstSearch: 'true',
                searchType: 'basic',
                level_1: 'on',
                isBinding: 'N',
                isLogIn: 'N',
                orgName: '',
                orgId: '',
                tenderName: keyword,
                tenderId: '',
                tenderType: 'TENDER_DECLARATION',
                tenderWay: 'TENDER_WAY_ALL_DECLARATION',
                dateType: 'isSpdt',
                radProctrgCate: ''
            });

            const targetUrl = `${baseUrl}?${params.toString()}`;

            try {
                await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

                try {
                    await page.waitForSelector('table.tb_01', { timeout: 10000 });
                } catch (e) {
                    console.log(`No results for ${keyword}.`);
                    continue;
                }

                // Extract list data
                const extraction = await page.$$eval('table.tb_01 tr', trs => {
                    return trs.map(tr => {
                        const tds = tr.querySelectorAll('td');
                        if (tds.length < 8) return null; // Standard rows have 8+ columns

                        // Find the actual tender link (usually in column 2 or 3)
                        const link = Array.from(tr.querySelectorAll('a')).find(a => a.href && a.href.includes('tpam'));
                        if (!link) return null;

                        const agency = tds[1].innerText.trim().split('\n')[0];
                        const titleFull = link.innerText.trim();
                        const title = titleFull.split('\n').pop().trim();

                        // [FILTER] Exclude "工程" tenders based on Category column (tds[5])
                        const category = tds[5] ? tds[5].innerText.trim() : '';
                        if (category.includes('工程')) return null;

                        // [OPTIMIZATION] Only fetch detail if correction notice or missing budget
                        const isCorrection = tds[2] ? tds[2].innerText.includes('更正') : false;

                        // Correct indices when using only querySelectorAll('td') and first cell is <th>
                        const publishDate = tds[6] ? tds[6].innerText.trim().split('\n')[0] : '';
                        const endDate = tds[7] ? tds[7].innerText.trim() : '';
                        let budget = tds[8] ? tds[8].innerText.trim() : '';

                        const budgetVal = parseFloat(budget.replace(/,/g, ''));
                        const isBudgetMissing = isNaN(budgetVal) || budgetVal === 0;

                        return {
                            agency,
                            title,
                            url: link.href,
                            budget,
                            publishDate,
                            endDate, // This is usually the deadline date
                            source: 'PCC',
                            needsDetail: isCorrection || isBudgetMissing
                        };
                    }).filter(item => item && item.title);
                });

                // Filter active items (Strictly show only future/today deadline)
                const activeItems = extraction.filter(item => {
                    const isFuture = isFutureOrToday(item.endDate);
                    if (!isFuture) {
                        console.log(`PCC: Skipping expired project: ${item.title} (Deadline: ${item.endDate})`);
                    }
                    return isFuture;
                });

                console.log(`PCC: Found ${activeItems.length} active matches for "${keyword}". Fetching details selectively...`);

                const finalItems = [];
                // For each active item, fetch details selectively.
                for (const item of activeItems) {
                    if (!item.needsDetail) {
                        console.log(`PCC: Skipping detail for "${item.title}" (Date/Budget already found)`);
                        finalItems.push(item);
                        continue;
                    }

                    let retryCount = 0;
                    let success = false;

                    // Set Referer to seem more like a real user flow
                    await page.setExtraHTTPHeaders({ 'Referer': targetUrl });

                    while (retryCount < 2 && !success) {
                        try {
                            // Randomized human-like delay
                            const delay = 1000 + Math.random() * 1000;
                            await new Promise(r => setTimeout(r, delay));

                            if (retryCount > 0) {
                                console.log(`PCC: Retrying detail fetch for ${item.title} (Attempt ${retryCount + 1})...`);
                                await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
                            }

                            // Navigate to detail with short timeout
                            await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 15000 });

                            // Check if blocked or empty
                            const pageInfo = await page.evaluate(() => {
                                const text = document.body.innerText;
                                const isBlocked = text.includes('blocked') || text.includes('B區') || text.includes('遊戲');
                                const isEmpty = text.trim().length < 100;
                                return { isBlocked, isEmpty };
                            });

                            if (pageInfo.isBlocked || pageInfo.isEmpty) {
                                retryCount++;
                                continue;
                            }

                            const details = await page.evaluate(() => {
                                const res = { budget: '', openTime: '', publishDate: '' };
                                const rows = Array.from(document.querySelectorAll('tr'));
                                rows.forEach(tr => {
                                    const th = tr.querySelector('th');
                                    const td = tr.querySelector('td');
                                    if (th && td) {
                                        const key = th.innerText.trim();
                                        const val = td.innerText.trim();
                                        if (key.includes('預算金額')) res.budget = val;
                                        if (key.includes('開標時間')) res.openTime = val;
                                        // Priority on original announcement date
                                        if (key.includes('本案公告日期')) res.publishDate = val.split('\n')[0].trim();
                                        if (!res.publishDate && key === '公告日') res.publishDate = val.split('\n')[0].trim();
                                    }
                                });
                                return res;
                            });

                            // Update endDate to include full time if found
                            if (details.openTime) {
                                item.endDate = details.openTime;
                            }
                            // Update publish date from detail if available (more accurate for corrections)
                            if (details.publishDate) {
                                item.publishDate = details.publishDate;
                            }
                            // If budget from list was empty or generic, use the detail one
                            if (details.budget && (!item.budget || isNaN(parseFloat(item.budget.replace(/,/g, ''))))) {
                                item.budget = details.budget;
                            }
                            success = true;
                        } catch (detailErr) {
                            console.log(`PCC: Detail fetch error for ${item.title}: ${detailErr.message}`);
                            retryCount++;
                        }
                    }

                    if (!success) {
                        console.log(`PCC: Falling back to list data for ${item.title} after retries.`);
                    }

                    finalItems.push(item);
                }

                finalResults.push(...finalItems);
                await new Promise(r => setTimeout(r, 2000));

            } catch (err) {
                console.error(`Error searching for ${keyword}:`, err);
            }
        }

    } catch (error) {
        console.error('PCC scraper error:', error);
    } finally {
        await browser.close();
    }
    return finalResults;
}

module.exports = { scrapePCC };
