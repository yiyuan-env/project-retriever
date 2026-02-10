const { sendNotification } = require('./utils/notifier');

const MOCK_PROJECTS = [
    {
        title: "Test Project 1: Environmental Education",
        url: "https://example.com/1",
        source: "PCC"
    },
    {
        title: "Test Project 2: Construction Work",
        url: "https://example.com/2",
        source: "TaiwanBuying"
    }
];

console.log('--- Verifying Desktop Notifier ---');
console.log('Sending notification for 2 mock projects...');

try {
    sendNotification(MOCK_PROJECTS);
    console.log('\nCheck your desktop for a notification toast!');
    console.log('If you see it, the notifier works.');
} catch (e) {
    console.error('Notification Failed:', e);
}
