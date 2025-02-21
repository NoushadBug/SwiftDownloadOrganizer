// background.js

// Set up side panel behavior when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel
        .setPanelBehavior({
            openPanelOnActionClick: true
        })
        .catch((error) =>
            console.error('Error setting panel behavior:', error)
        );
});

chrome.runtime.onInstalled.addListener(() => {
    console.log('[Service Worker] Extension installed or updated.');
});

// Named function for handling download filename determination
function determineFilename(item, suggest) {
    chrome.storage.sync.get({ rules: [] }, (data) => {
        let bestRule = null;
        // Iterate over all defined rules
        data.rules.forEach((rule) => {
            let match = true;
            if (rule.conditions) {
                // Check file extension match if condition exists
                if (rule.conditions.fileExtension) {
                    const fileExt = item.filename.split('.').pop().toLowerCase();
                    if (fileExt !== rule.conditions.fileExtension.toLowerCase()) {
                        match = false;
                    }
                }
                // Check if the source URL contains the specified string
                if (rule.conditions.sourceUrlContains) {
                    if (!item.url.includes(rule.conditions.sourceUrlContains)) {
                        match = false;
                    }
                }
            }
            // If rule matches, consider its precedence (default to 0 if undefined)
            if (match) {
                rule.precedence = rule.precedence || 0;
                if (!bestRule || rule.precedence > bestRule.precedence) {
                    bestRule = rule;
                }
            }
        });

        // If a matching rule is found, modify the filename accordingly.
        if (bestRule) {
            const newName =
                bestRule.folder + "/" + item.filename.split('/').pop();
            suggest({ filename: newName });
        } else {
            suggest();
        }
    });
    // Returning true signals asynchronous handling of the callback.
    return true;
}

// Register the filename determination listener
chrome.downloads.onDeterminingFilename.addListener(determineFilename);
