const cron = require('node-cron');
const { scrapePCC } = require('./scrapers/pcc');
const { scrapeTaiwanBuying } = require('./scrapers/taiwanbuying');
const { sendNotification } = require('./utils/notifier');
const { generateHtmlReport } = require('./utils/reporter');
require('dotenv').config();

// Keywords provided by user
const KEYWORDS = [
    '環境教育', '源頭減量', '低碳', '永續', '生態旅遊',
    '淨零', '綠色辦公', '環保餐廳', '回收', '菸蒂',
    '毒化', '病媒', '廢棄物', '推動', '推廣', '宣導',
    '志工', '培訓', '解說', '綠生活', '綠色', '綠能',
    '培育', '推展', '推行', '導覽', '海洋', '巡守'
];

async function runTask() {
    console.log('Running scheduled task at:', new Date().toLocaleString());

    try {
        const pccProjects = await scrapePCC(KEYWORDS);
        const tbProjects = await scrapeTaiwanBuying(KEYWORDS);

        const allProjects = [...pccProjects, ...tbProjects];

        console.log(`Total projects found matching keywords: ${allProjects.length}`);

        if (allProjects.length > 0) {
            const reportPath = generateHtmlReport(allProjects);
            console.log(`Report generated: ${reportPath}`);
            await sendNotification(allProjects, reportPath);
        } else {
            console.log('No matching projects found today.');
        }

    } catch (error) {
        console.error('Error in main task:', error);
    }
}

// Run immediately on start for testing
runTask();

// Schedule to run every day at 9:00 AM
cron.schedule('0 9 * * *', () => {
    runTask();
});

// Schedule to run every day at 2:00 PM (14:00)
cron.schedule('0 14 * * *', () => {
    runTask();
});
