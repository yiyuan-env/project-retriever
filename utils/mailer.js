const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendNotification(projects) {
    if (!projects || projects.length === 0) return;

    const subject = `[Project Retriever] Found ${projects.length} New Environmental Projects`;

    let htmlContent = `<h2>Found the following new projects:</h2><ul>`;

    projects.forEach(p => {
        htmlContent += `
      <li>
        <strong>${p.title}</strong><br>
        Source: ${p.source}<br>
        Date: ${p.date}<br>
        <a href="${p.url}">Link to Project</a>
      </li>
      <br>
    `;
    });

    htmlContent += `</ul>`;

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Sending to self
            subject: subject,
            html: htmlContent,
        });
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = { sendNotification };
