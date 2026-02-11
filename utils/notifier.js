const notifier = require('node-notifier');
const { exec } = require('child_process');

async function sendNotification(projects, reportPath = null, newCount = 0) {
    if (!projects || projects.length === 0) return;

    const count = projects.length;

    // Auto-open the report in the browser immediately
    if (reportPath) {
        console.log(`Opening report in browser: ${reportPath}`);
        exec(`start "" "${reportPath}"`);
    }

    // Build notification message with new count info
    let message;
    if (newCount > 0) {
        message = `Found ${count} projects (${newCount} new!).\nReport has been opened in your browser.`;
    } else {
        message = `Found ${count} projects (all previously seen).\nReport has been opened in your browser.`;
    }

    notifier.notify({
        title: 'Project Retriever',
        message: message,
        sound: true,
        wait: false,
        timeout: 30
    });

    console.log('\n=============================================');
    console.log(`[ALERT] Found ${count} Projects (${newCount} new):`);
    projects.forEach((p, index) => {
        const badge = p.isNew ? '🆕' : '  ';
        console.log(`${badge} ${index + 1}. ${p.title}`);
        console.log(`   Source: ${p.source}`);
        console.log(`   Link: ${p.url}`);
    });
    console.log('=============================================\n');
}

module.exports = { sendNotification };

