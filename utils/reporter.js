const fs = require('fs');
const path = require('path');

function generateHtmlReport(projects) {
    if (!projects) projects = [];
    const timestamp = new Date().toLocaleString();
    const filePath = path.join(process.cwd(), 'tender_report.html');

    const tableRows = projects.map(p => {
        const sourceDisplay = p.source === 'PCC' ? '政府電子採購網' : '台灣採購公報網';
        const tagClass = p.source === 'PCC' ? 'tag-pcc' : 'tag-tb';
        return `
                <tr>
                    <td><span class="source-tag ${tagClass}">${sourceDisplay}</span></td>
                    <td>${p.agency || '-'}</td>
                    <td><a href="${p.url}" class="project-link" target="_blank">${p.title}</a></td>
                    <td class="amount">${p.budget || '-'}</td>
                    <td class="date-cell">${p.publishDate || '-'}</td>
                    <td class="date-cell">${p.endDate || p.date || '-'}</td>
                </tr>
                `;
    }).join('');

    const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>政府標案報表（Taiwan Tender Report） - ${timestamp}</title>
    <style>
        body {
            font-family: 'PingFang TC', 'Heiti TC', 'Microsoft JhengHei', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f0f2f5;
        }
        h1 {
            color: #1a3a5f;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            text-align: center;
        }
        .meta {
            color: #666;
            margin-bottom: 20px;
            text-align: center;
            font-size: 0.9em;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.08);
            border-radius: 8px;
            overflow: hidden;
            margin-top: 20px;
        }
        th, td {
            text-align: left;
            padding: 14px 12px;
            border-bottom: 1px solid #edf2f7;
        }
        th {
            background-color: #3498db;
            color: white;
            font-weight: 600;
            white-space: nowrap;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        tr:hover {
            background-color: #ebf8ff;
        }
        .project-link {
            color: #2980b9;
            text-decoration: none;
            font-weight: 600;
            display: block;
            margin-bottom: 4px;
        }
        .project-link:hover {
            text-decoration: underline;
        }
        .source-tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            color: white;
        }
        .tag-pcc { background-color: #2c3e50; }
        .tag-tb { background-color: #8e44ad; }
        .amount {
            color: #e53e3e;
            font-weight: 700;
            white-space: nowrap;
            text-align: right;
        }
        .date-cell {
            font-size: 0.9em;
            color: #4a5568;
            white-space: nowrap;
        }
        .location {
            font-size: 0.85em;
            color: #718096;
            max-width: 250px;
            word-break: break-all;
        }
        .no-results {
            text-align: center;
            padding: 80px;
            color: #a0aec0;
            background: white;
            border-radius: 12px;
            font-size: 1.2em;
        }
    </style>
</head>
<body>
    <h1>政府標案報表（Taiwan Tender Report）</h1>
    <p class="meta">報表產生時間: ${timestamp} | 共找到 ${projects.length} 件潛在標案。</p>

    ${projects.length === 0 ? '<div class="no-results">本次掃描未發現符合關鍵字的進行中標案。</div>' : `
    <table>
        <thead>
            <tr>
                <th>來源</th>
                <th>機關</th>
                <th>標案名稱</th>
                <th style="text-align: right;">預算金額</th>
                <th>公告日</th>
                <th>截止投標日期</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
    `}

</body>
</html>
    `;

    fs.writeFileSync(filePath, html);
    return filePath;
}

module.exports = { generateHtmlReport };
