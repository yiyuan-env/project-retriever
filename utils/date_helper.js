function parseDate(dateStr) {
    if (!dateStr || dateStr === 'Unknown Date') return null;

    // Remove any extra text, just get the YYYY/MM/DD or YYY/MM/DD
    const match = dateStr.match(/(\d{3,4})\/(\d{1,2})\/(\d{1,2})/);
    if (!match) return null;

    let year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1; // JS months are 0-indexed
    const day = parseInt(match[3]);

    // Handle ROC year (3 digits)
    if (year < 1000) {
        year += 1911;
    }

    return new Date(year, month, day);
}

function isFutureOrToday(dateStr) {
    const tenderDate = parseDate(dateStr);
    if (!tenderDate) return false; // Exclude if we can't parse it (User requirement: strictly future)

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tenderDate >= today;
}

module.exports = { isFutureOrToday, parseDate };
