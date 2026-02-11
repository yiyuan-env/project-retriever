const fs = require('fs');
const path = require('path');

const SEEN_FILE = path.join(__dirname, '..', 'seen_projects.json');

/**
 * Load the set of previously seen project URLs.
 * Returns a Set of URL strings.
 */
function loadSeenProjects() {
    try {
        if (fs.existsSync(SEEN_FILE)) {
            const data = JSON.parse(fs.readFileSync(SEEN_FILE, 'utf-8'));
            return new Set(data.urls || []);
        }
    } catch (err) {
        console.log('Warning: Could not read seen_projects.json, starting fresh.');
    }
    return new Set();
}

/**
 * Save the set of seen project URLs to disk.
 * @param {Set<string>} seenSet
 */
function saveSeenProjects(seenSet) {
    const data = {
        lastUpdated: new Date().toISOString(),
        urls: Array.from(seenSet)
    };
    fs.writeFileSync(SEEN_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Mark each project with an `isNew` property.
 * Returns the count of new projects.
 * Also updates the seen set with all current project URLs.
 * @param {Array} projects
 * @returns {{ newCount: number }}
 */
function markNewProjects(projects) {
    const seenSet = loadSeenProjects();
    let newCount = 0;

    for (const project of projects) {
        if (!seenSet.has(project.url)) {
            project.isNew = true;
            newCount++;
            seenSet.add(project.url);
        } else {
            project.isNew = false;
        }
    }

    // Sort: new projects first, then previously seen
    projects.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

    saveSeenProjects(seenSet);
    return { newCount };
}

module.exports = { markNewProjects };
