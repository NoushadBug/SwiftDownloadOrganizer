// background.js

// Set up side panel behavior when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel
        .setPanelBehavior({
            openPanelOnActionClick: true,
        })
        .catch((error) => console.error('Error setting panel behavior:', error));
});

chrome.runtime.onInstalled.addListener(() => {
    console.log('[Service Worker] Extension installed or updated.');
});

// Named function for handling download filename determination
function determineFilename(item, suggest) {
    // Load both rules and extensionGroups from storage
    chrome.storage.sync.get({ rules: [], extensionGroups: {} }, (data) => {
        let rules = data.rules || [];
        let extensionGroups = data.extensionGroups || {};

        // Sort rules by precedence (descending), so highest precedence is checked first
        rules.sort((a, b) => (b.precedence || 0) - (a.precedence || 0));

        const fileExt = (item.filename.split('.').pop() || '').toLowerCase();
        let bestRule = null;
        console.log(item)
        
        
        // Check each rule in order
        for (const rule of rules) {
            if (!rule.conditions) continue;
            console.log(fileExt)

            let match = true;

            // 1. If rule has a group condition, verify the actual file extension is in that group
            if (rule.conditions.extensionGroup) {
                const groupName = rule.conditions.extensionGroup;
                // If group doesn't exist or doesn't include this extension, skip
                if (!extensionGroups[groupName] || !extensionGroups[groupName].includes(fileExt)) {
                    match = false;
                }
            }

            // 2. If rule has a fileExtension condition, compare directly
            if (match && rule.conditions.fileExtension) {
                if (fileExt !== rule.conditions.fileExtension.toLowerCase()) {
                    match = false;
                }
            }

            // 3. If rule has a sourceUrlContains condition, check item.url
            if (match && rule.conditions.sourceUrlContains) {
                if (!item.url.includes(rule.conditions.sourceUrlContains)) {
                    match = false;
                }
            }

            // If all conditions matched, this is the best rule for now
            if (match) {
                bestRule = rule;
                // Because we sorted rules descending by precedence,
                // the first match is the highest-precedence match.
                break;
            }
        }
        console.log(rules)
        console.log(extensionGroups)

        // If a matching rule is found, modify the filename accordingly.
        if (bestRule) {
            const baseFilename = item.filename.split('/').pop();
            const newName = bestRule.folder + '/' + baseFilename;
            console.log(newName)
            suggest({ filename: newName });
        } else {
            suggest(); // No matching rule
        }
    });

    // Returning true signals asynchronous handling of the callback
    return true;
}

// Register the filename determination listener
chrome.downloads.onDeterminingFilename.addListener(determineFilename);
