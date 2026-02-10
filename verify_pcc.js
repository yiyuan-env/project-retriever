const { scrapePCC } = require('./scrapers/pcc');

const TEST_KEYWORDS = ['環境'];

async function verify() {
    console.log('--- Verifying PCC Scraper Fix ---');
    try {
        console.log(`Searching for keywords: ${TEST_KEYWORDS.join(', ')}`);
        const results = await scrapePCC(TEST_KEYWORDS);

        console.log('\n--- Scraping Complete ---');
        console.log(`Total items found: ${results.length}`);

        if (results.length > 0) {
            console.log('Sample Result:');
            console.log(JSON.stringify(results[0], null, 2));
        } else {
            console.log('No results found. This might mean no ACTIVE tenders match "環境" right now.');
        }

    } catch (e) {
        console.error('Verification Failed:', e);
    }
}

verify();
