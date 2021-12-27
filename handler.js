'use strict';
const rootContextMenuId = 'root-menu';

const centralUrl = 'https://jira.devfactory.com';
const centralContextMenuId = 'central';
const centralOpenSelectedContextMenuId = 'central-open-selected';

const trilogyUrl = 'https://trilogy-eng.atlassian.net';
const trilogyContextMenuId = 'trilogy';
const trilogyOpenSelectedContextMenuId = 'trilogy-jira-open-selected';
const trilogyFindTicketGivenLegacyContextMenuId = 'trilogy-find-ticket-given-legacy';

const devalpUrl = 'https://devgraph-alp.atlassian.net';
const devalpContextMenuId = 'devalp';
const devalpOpenSelectedContextMenuId = 'devalp-open-selected';
const devalpFindRelatedENGGContextMenuId = 'devalp-find-related-engg';

const jiraKeyMatcher = /^[A-Z0-9]+-\d+$/;
const jiraKeyMatcherInUrl = /(?<=\/browse\/)[A-Z0-9]+-\d+/;
const contextsArray = [
  'selection',
  'link',
  'page',
];
const defaultContextMenuProps = {
  contexts: contextsArray,
};

function notifyUser(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/128.png',
    title: 'Jira Key not found',
    message,
    silent: true,
  });
}

function detectKey(info) {
  if (info.selectionText) {
    if (jiraKeyMatcher.test(info.selectionText)) {
      return info.selectionText;
    } else {
      notifyUser(`The selected text does not look like a Jira key: ${info.selectionText}`);
    }
  } else if (info.linkUrl) {
    const matches = info.linkUrl.match(jiraKeyMatcherInUrl);
    if (matches) {
      return matches[0];
    } else {
      notifyUser(`This link does not contain a Jira key: ${info.linkUrl}`);
    }
  } else if (info.pageUrl) {
    const matches = info.pageUrl.match(jiraKeyMatcherInUrl);
    if (matches && matches.length > 0) {
      return matches[0];
    } else {
      notifyUser(`The URL of the current tab does not contain a Jira key: ${info.pageUrl}`);
    }
  }
}

function determineUrl(menuItemId, key) {
  if (menuItemId === centralOpenSelectedContextMenuId) {
    return `${centralUrl}/browse/${key}`;
  } else if (menuItemId === trilogyOpenSelectedContextMenuId) {
    return `${trilogyUrl}/browse/${key}`;
  } else if (menuItemId === trilogyFindTicketGivenLegacyContextMenuId) {
    const jql = `"Legacy Issue Key[Short text]" ~ "${key}"`;
    return `${trilogyUrl}/issues/?jql=${encodeURI(jql)}`;
  } else if (menuItemId === devalpOpenSelectedContextMenuId) {
    return `${devalpUrl}/browse/${key}`;
  } else if (menuItemId === devalpFindRelatedENGGContextMenuId) {
    const jql = `"Work Data Structure Link[URL Field]" = "${trilogyUrl}/browse/${key}"`;
    return `${devalpUrl}/issues/?jql=${encodeURI(jql)}`;
  }
}

function handleOnClicked(info, tab) {
  if (!info) {
    return;
  }

  const detectedKey = detectKey(info);
  if (!detectedKey) {
    return;
  }

  const url = determineUrl(info.menuItemId, detectedKey);
  if (!url) {
    return;
  }

  chrome.tabs.create({
    url,
    index: tab.index + 1,
  });
}

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
  title: 'Open Jira',
  id: rootContextMenuId,
  ...defaultContextMenuProps,
});

function createCentralJiraContextMenu() {
  chrome.contextMenus.create({
    title: 'Central Jira',
    id: centralContextMenuId,
    parentId: rootContextMenuId,
    ...defaultContextMenuProps,
  });

  chrome.contextMenus.create({
    title: 'Open in Central Jira',
    id: centralOpenSelectedContextMenuId,
    parentId: centralContextMenuId,
    ...defaultContextMenuProps,
  });
}

function createTrilogyContextMenu() {
  chrome.contextMenus.create({
    title: 'Trilogy Eng',
    id: trilogyContextMenuId,
    parentId: rootContextMenuId,
    ...defaultContextMenuProps,
  });

  chrome.contextMenus.create({
    title: 'Open in Trilogy Eng',
    id: trilogyOpenSelectedContextMenuId,
    parentId: trilogyContextMenuId,
    ...defaultContextMenuProps,
  });

  chrome.contextMenus.create({
    title: 'Find Cloud ticket given Legacy issue key',
    id: trilogyFindTicketGivenLegacyContextMenuId,
    parentId: trilogyContextMenuId,
    ...defaultContextMenuProps,
  });
}

function createDevgraphAlpContextMenu() {
  chrome.contextMenus.create({
    title: 'Devraph Alp',
    id: devalpContextMenuId,
    parentId: rootContextMenuId,
    ...defaultContextMenuProps,
  });

  chrome.contextMenus.create({
    title: 'Open in Devraph Alp',
    id: devalpOpenSelectedContextMenuId,
    parentId: devalpContextMenuId,
    ...defaultContextMenuProps,
  });

  chrome.contextMenus.create({
    title: 'Find related ENGG ticket given Cloud ticket key',
    id: devalpFindRelatedENGGContextMenuId,
    parentId: devalpContextMenuId,
    ...defaultContextMenuProps,
  });
}

createCentralJiraContextMenu();
createTrilogyContextMenu();
createDevgraphAlpContextMenu();

chrome.contextMenus.onClicked.addListener(handleOnClicked);
