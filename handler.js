const contextMenuId = 'musaecer-selection-jira';
const jiraKeyMatcher = /^[A-Z0-9]+-\d+$/;

function handleOnClicked(info, tab) {
  if (!info || !info.selectionText || info.menuItemId !== contextMenuId) {
    return;
  }

  if (jiraKeyMatcher.test(info.selectionText)) {
    // open a new tab
    chrome.tabs.create({
      url: `https://jira.devfactory.com/browse/${info.selectionText}`,
    });
  } else {
    // notify the user
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/128.png',
      title: 'Jira Key not found',
      message: `The text '${info.selectionText}' does not look like a Jira key.`,
    });
  }
}

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
  title: 'Open Jira for this key',
  contexts: ['selection'],
  id: contextMenuId,
});

chrome.contextMenus.onClicked.addListener(handleOnClicked);
