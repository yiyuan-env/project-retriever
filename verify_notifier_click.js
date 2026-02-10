const { sendNotification } = require('./utils/notifier');
const path = require('path');

// Simulate finding one project
const mockProjects = [
    { title: 'Test Project - Click Me!', source: 'Test', url: 'https://www.google.com' }
];

// Use the existing report or a placeholder
const reportPath = path.join(__dirname, 'tender_report.html');

console.log('--- Notification Test ---');
console.log('A notification will appear shortly.');
console.log('Please CLICK it to see if the browser opens the report.');
console.log('-------------------------');

sendNotification(mockProjects, reportPath);
