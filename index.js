const cron = require('node-cron');
const notifier = require('node-notifier');
const { scrapePCC } = require('./scrapers/pcc');
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
    console.log('');
    console.log('========================================');
    console.log(' Running scheduled task at:', new Date().toLocaleString());
    console.log('========================================');
    console.log('');

    try {
        console.log('[1/3] Scraping PCC (政府電子採購網)...');
        const pccProjects = await scrapePCC(KEYWORDS);
        console.log(`      ✔ PCC done. Found ${pccProjects.length} projects.`);
        console.log('');

        const allProjects = [...pccProjects];

        console.log('========================================');
        console.log(`[2/3] Total projects found: ${allProjects.length}`);
        console.log('========================================');
        console.log('');

        if (allProjects.length > 0) {
            console.log('[3/3] Generating report & sending notification...');
            const reportPath = generateHtmlReport(allProjects);
            console.log(`      ✔ Report generated: ${reportPath}`);
            await sendNotification(allProjects, reportPath);
            console.log('      ✔ Notification sent!');
        } else {
            console.log('[3/3] No matching projects found today.');
            // Still send a notification so the user knows the task completed
            notifier.notify({
                title: 'Project Retriever',
                message: 'Scraping complete. No new projects found today.',
                sound: true,
                timeout: 15
            });
            console.log('      ✔ Completion notification sent.');
        }

        console.log('');
        console.log('========================================');
        console.log(' ✔ All done!');
        console.log('========================================');

    } catch (error) {
        console.error('Error in main task:', error);
        // Notify even on error
        notifier.notify({
            title: 'Project Retriever - Error',
            message: `An error occurred: ${error.message}`,
            sound: true,
            timeout: 15
        });
    }
}

// Check if running in "once" mode (e.g., from Task Scheduler)
const runOnce = process.argv.includes('--once');

if (runOnce) {
    console.log('Running in single-execution mode...');
    runTask().then(() => {
        console.log('Task completed. Waiting for notification to display...');
        // Wait 3 seconds to allow the Windows notification to fully display
        setTimeout(() => {
            process.exit(0);
        }, 3000);
    });
} else {
    // Run immediately on start for long-running mode
    runTask();

    // Schedule to run every day at 10:00 AM
    cron.schedule('0 10 * * *', () => {
        runTask();
    });

    // Schedule to run every day at 4:00 PM (16:00)
    cron.schedule('0 16 * * *', () => {
        runTask();
    });
}
