const fs = require('fs');
const path = require('path');

const SEEN_FILE = path.join(__dirname, '..', 'seen_projects.json');

/**
 * Load the set of confirmed-seen URLs and the pending-new URLs from last run.
 * Returns { seen: Set, pending: Set }
 */
function loadSeenProjects() {
    try {
        if (fs.existsSync(SEEN_FILE)) {
            const data = JSON.parse(fs.readFileSync(SEEN_FILE, 'utf-8'));
            return {
                seen: new Set(data.urls || []),
                pending: new Set(data.pendingNew || [])
            };
        }
    } catch (err) {
        console.log('Warning: Could not read seen_projects.json, starting fresh.');
    }
    return { seen: new Set(), pending: new Set() };
}

/**
 * Save seen URLs and pendingNew URLs to disk.
 * @param {Set<string>} seenSet   - confirmed seen (2+ scrape cycles old)
 * @param {Set<string>} pendingSet - new from last run (still shown as NEW this run)
 */
function saveSeenProjects(seenSet, pendingSet) {
    const data = {
        lastUpdated: new Date().toISOString(),
        urls: Array.from(seenSet),
        pendingNew: Array.from(pendingSet)
    };
    fs.writeFileSync(SEEN_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Mark each project with an `isNew` property.
 * New tenders stay marked "new" for at least 2 scrape cycles so the user
 * has a real chance to see them before they turn "seen".
 *
 * Lifecycle:
 *   Run 1 – URL first scraped  → isNew=true,  goes into pendingNew
 *   Run 2 – URL still active   → isNew=true,  pendingNew graduates → seen; URL removed from pendingNew
 *   Run 3+ – URL in seen       → isNew=false
 *
 * @param {Array} projects
 * @returns {{ newCount: number }}
 */
function markNewProjects(projects) {
    const { seen, pending } = loadSeenProjects();
    let newCount = 0;
    const currentNew = new Set();

    for (const project of projects) {
        if (!seen.has(project.url)) {
            // Not yet confirmed-seen: mark as new
            project.isNew = true;
            newCount++;
            // Only add to currentNew if it wasn't already in pending
            // (pending ones are graduating this run, not brand new)
            if (!pending.has(project.url)) {
                currentNew.add(project.url);
            }
        } else {
            project.isNew = false;
        }
    }

    // Graduate: pending (shown as new last run) → confirmed seen
    const newSeen = new Set([...seen, ...pending]);
    // currentNew becomes the new pendingNew for next run
    saveSeenProjects(newSeen, currentNew);

    // Sort: new projects first, then previously seen
    projects.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

    return { newCount };
}

module.exports = { markNewProjects };
