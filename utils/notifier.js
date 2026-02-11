const notifier = require('node-notifier');
const { exec } = require('child_process');

async function sendNotification(projects, reportPath = null) {
    if (!projects || projects.length === 0) return;

    const count = projects.length;

    // Auto-open the report in the browser immediately
    if (reportPath) {
        console.log(`Opening report in browser: ${reportPath}`);
        exec(`start "" "${reportPath}"`);
    }

    // Send a desktop notification as an alert
    const message = reportPath
        ? `Found ${count} new environmental projects!\nReport has been opened in your browser.`
        : `Found ${count} new environmental projects!\nDetails in console.`;

    notifier.notify({
        title: 'Project Retriever',
        message: message,
        sound: true,
        wait: false,
        timeout: 30
    });

    console.log('\n=============================================');
    console.log(`[ALERT] Found ${count} New Projects:`);
    projects.forEach((p, index) => {
        console.log(`${index + 1}. ${p.title}`);
        console.log(`   Source: ${p.source}`);
        console.log(`   Link: ${p.url}`);
    });
    console.log('=============================================\n');
}

module.exports = { sendNotification };
