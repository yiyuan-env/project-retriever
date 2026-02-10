const notifier = require('node-notifier');
const { exec } = require('child_process');

function sendNotification(projects, reportPath = null) {
    if (!projects || projects.length === 0) return;

    const count = projects.length;
    const message = reportPath
        ? `Found ${count} new environmental projects!\nClick this notification to view the report.`
        : `Found ${count} new environmental projects!\nDetails in console.`;

    notifier.notify({
        title: 'Project Retriever',
        message: message,
        sound: true,
        wait: true
    });

    // Handle clicks
    notifier.on('click', () => {
        if (reportPath) {
            console.log(`Opening report: ${reportPath}`);
            exec(`start "" "${reportPath}"`);
        }
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
