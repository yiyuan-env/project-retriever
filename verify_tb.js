const { scrapeTaiwanBuying } = require('./scrapers/taiwanbuying');

const TEST_KEYWORDS = ['環境', '工程'];

async function verify() {
    console.log('--- Verifying TaiwanBuying Scraper ---');
    try {
        console.log(`Searching for keywords: ${TEST_KEYWORDS.join(', ')}`);
        const results = await scrapeTaiwanBuying(TEST_KEYWORDS);

        console.log('\n--- Scraping Complete ---');
        console.log(`Total items found: ${results.length}`);

        if (results.length > 0) {
            console.log('Sample Result:');
            console.log(JSON.stringify(results[0], null, 2));
        } else {
            console.log('No results found.');
        }

    } catch (e) {
        console.error('Verification Failed:', e);
    }
}

verify();
