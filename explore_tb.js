const puppeteer = require('puppeteer');
const fs = require('fs');

async function explore() {
    console.log('Exploring TaiwanBuying...');
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
        console.log('Visiting Homepage...');
        await page.goto('https://www.taiwanbuying.com.tw/', { waitUntil: 'domcontentloaded' });
        const html = await page.content();
        fs.writeFileSync('tb_home.html', html);
        console.log('Homepage dumped to tb_home.html');

        // Extract all links to see if we can find the tender list
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).map(a => ({
                text: a.innerText.trim(),
                href: a.href
            })).filter(l => l.text.length > 0);
        });
        fs.writeFileSync('tb_links.json', JSON.stringify(links, null, 2));
        console.log('Links extracted to tb_links.json');

    } catch (error) {
        console.error('Exploration Failed:', error);
    } finally {
        await browser.close();
    }
}

explore();
