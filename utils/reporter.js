const fs = require('fs');
const path = require('path');

function generateHtmlReport(projects) {
    if (!projects) projects = [];
    const timestamp = new Date().toLocaleString();
    const filePath = path.join(process.cwd(), 'tender_report.html');

    const newCount = projects.filter(p => p.isNew).length;
    const seenCount = projects.length - newCount;

    const tableRows = projects.map(p => {
        const sourceDisplay = p.source === 'PCC' ? '政府電子採購網' : '台灣採購公報網';
        const tagClass = p.source === 'PCC' ? 'tag-pcc' : 'tag-tb';
        const newBadge = p.isNew ? '<span class="new-badge">🆕 NEW</span>' : '';
        const rowClass = p.isNew ? 'new-row' : '';
        return `
                <tr class="${rowClass}">
                    <td>${newBadge}</td>
                    <td><span class="source-tag ${tagClass}">${sourceDisplay}</span></td>
                    <td>${p.agency || '-'}</td>
                    <td><a href="${p.url}" class="project-link" target="_blank">${p.title}</a></td>
                    <td class="amount">${p.budget || '-'}</td>
                    <td class="date-cell" data-date="${p.publishDate || ''}">${p.publishDate || '-'}</td>
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
        .new-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            background-color: #48bb78;
            color: white;
            white-space: nowrap;
        }
        .new-row {
            background-color: #f0fff4 !important;
            border-left: 4px solid #48bb78;
        }
        .new-row:hover {
            background-color: #e6ffed !important;
        }
        th.sortable {
            cursor: pointer;
            user-select: none;
        }
        th.sortable:hover {
            background-color: #2980b9;
        }
        th.sortable .sort-icon {
            margin-left: 6px;
            font-style: normal;
            opacity: 0.7;
        }
        .summary-bar {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 15px 0;
        }
        .summary-item {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
        }
        .summary-new {
            background-color: #48bb78;
            color: white;
        }
        .summary-seen {
            background-color: #e2e8f0;
            color: #4a5568;
        }
        .summary-total {
            background-color: #3498db;
            color: white;
        }
    </style>
</head>
<body>
    <h1>政府標案報表（Taiwan Tender Report）</h1>
    <p class="meta">報表產生時間: ${timestamp}</p>
    <div class="summary-bar">
        <span class="summary-item summary-total">共 ${projects.length} 件標案</span>
        <span class="summary-item summary-new">🆕 ${newCount} 件新標案</span>
        <span class="summary-item summary-seen">${seenCount} 件已看過</span>
    </div>

    ${projects.length === 0 ? '<div class="no-results">本次掃描未發現符合關鍵字的進行中標案。</div>' : `
    <table>
        <thead>
            <tr>
                <th style="width: 80px;">狀態</th>
                <th>來源</th>
                <th>機關</th>
                <th>標案名稱</th>
                <th style="text-align: right;">預算金額</th>
                <th class="sortable">公告日<span class="sort-icon">⇅</span></th>
                <th>截止投標日期</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
    `}

<script>
(function() {
    var th = document.querySelector('th.sortable');
    if (!th) return;
    var icon = th.querySelector('.sort-icon');
    var asc = true;
    th.addEventListener('click', function() {
        var tbody = document.querySelector('tbody');
        if (!tbody) return;
        var rows = Array.from(tbody.querySelectorAll('tr'));
        rows.sort(function(a, b) {
            var da = a.querySelector('td[data-date]') ? a.querySelector('td[data-date]').getAttribute('data-date') : '';
            var db = b.querySelector('td[data-date]') ? b.querySelector('td[data-date]').getAttribute('data-date') : '';
            if (!da) return 1;
            if (!db) return -1;
            return asc ? da.localeCompare(db) : db.localeCompare(da);
        });
        rows.forEach(function(r) { tbody.appendChild(r); });
        icon.textContent = asc ? '▲' : '▼';
        asc = !asc;
    });
})();
</script>

</body>
</html>
    `;

    fs.writeFileSync(filePath, html);
    return filePath;
}

module.exports = { generateHtmlReport };
