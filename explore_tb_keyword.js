const puppeteer = require('puppeteer');
const fs = require('fs');

async function explore() {
    console.log('Exploring TaiwanBuying Query_Keyword...');
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
        console.log('Visiting Query_Keyword.ASP...');
        await page.goto('https://www.taiwanbuying.com.tw/Query_Keyword.ASP', { waitUntil: 'domcontentloaded' });

        const html = await page.content();
        fs.writeFileSync('tb_query_keyword.html', html);
        console.log('Page dumped to tb_query_keyword.html');

        // Extract form info
        const forms = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('form')).map(f => ({
                action: f.action,
                method: f.method,
                inputs: Array.from(f.querySelectorAll('input, select')).map(i => ({
                    name: i.name,
                    type: i.type,
                    value: i.value
                }))
            }));
        });
        fs.writeFileSync('tb_keyword_forms.json', JSON.stringify(forms, null, 2));
        console.log('Forms extracted to tb_keyword_forms.json');

    } catch (error) {
        console.error('Exploration Failed:', error);
    } finally {
        await browser.close();
    }
}

explore();
