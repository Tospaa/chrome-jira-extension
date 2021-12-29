'use strict';
class Handler {
  static rootContextMenuId = 'root-menu';

  static jiraKeyMatcher = /^[A-Z0-9]+-\d+$/;
  static jiraKeyMatcherInUrl = /(?<=\/browse\/)[A-Z0-9]+-\d+/;
  static contextsArray = [
    'selection',
    'link',
    'page',
  ];
  static defaultContextMenuProps = {
    contexts: Handler.contextsArray,
  };
  static jiraObjects = {
    [CentralJira.contextMenuId]: CentralJira,
    [TrilogyJira.contextMenuId]: TrilogyJira,
    [DevgraphAlpJira.contextMenuId]: DevgraphAlpJira,
  };

  static notifyUser(message) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/128.png',
      title: 'Jira Key not found',
      message,
      silent: true,
    });
  }

  static detectKey(info) {
    if (info.selectionText) {
      if (Handler.jiraKeyMatcher.test(info.selectionText)) {
        return info.selectionText;
      } else {
        Handler.notifyUser(`The selected text does not look like a Jira key: ${info.selectionText}`);
      }
    } else if (info.linkUrl) {
      const matches = info.linkUrl.match(Handler.jiraKeyMatcherInUrl);
      if (matches && matches.length > 0) {
        return matches[0];
      } else {
        Handler.notifyUser(`This link does not contain a Jira key: ${info.linkUrl}`);
      }
    } else if (info.pageUrl) {
      const matches = info.pageUrl.match(Handler.jiraKeyMatcherInUrl);
      if (matches && matches.length > 0) {
        return matches[0];
      } else {
        Handler.notifyUser(`The URL of the current tab does not contain a Jira key: ${info.pageUrl}`);
      }
    }
  }

  static determineUrl(info, key) {
    if (info.parentMenuItemId in Handler.jiraObjects) {
      const jiraObject = Handler.jiraObjects[info.parentMenuItemId];
      return jiraObject.determineUrl(info.menuItemId, key);
    }
  }

  static handleOnClicked(info, tab) {
    if (!info) {
      return;
    }

    const detectedKey = Handler.detectKey(info);
    if (!detectedKey) {
      return;
    }

    const url = Handler.determineUrl(info, detectedKey);
    if (!url) {
      return;
    }

    chrome.tabs.create({
      url,
      index: tab.index + 1,
    });
  }

  static main() {
    chrome.contextMenus.removeAll();

    chrome.contextMenus.create({
      title: 'Open Jira',
      id: Handler.rootContextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    for (let jira in Handler.jiraObjects) {
      const jiraObject = Handler.jiraObjects[jira];
      jiraObject.createContextMenu();
    }

    chrome.contextMenus.onClicked.addListener(Handler.handleOnClicked);
  }
}

Handler.main();
