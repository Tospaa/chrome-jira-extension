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

  static notifyUser(title, message) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/128.png',
      title,
      message,
      silent: true,
    }, function(notificationId) {
      setTimeout(() => {
        chrome.notifications.clear(notificationId);
      }, 5000);
    });
  }

  static detectKey(info) {
    if (info.selectionText) {
      if (Handler.jiraKeyMatcher.test(info.selectionText)) {
        return info.selectionText;
      } else {
        Handler.notifyUser(
          'Jira Key not found',
          `The selected text does not look like a Jira key: ${info.selectionText}`);
      }
    } else if (info.linkUrl) {
      const matches = info.linkUrl.match(Handler.jiraKeyMatcherInUrl);
      if (matches && matches.length > 0) {
        return matches[0];
      } else {
        Handler.notifyUser(
          'Jira Key not found',
          `This link does not contain a Jira key: ${info.linkUrl}`);
      }
    } else if (info.pageUrl) {
      const matches = info.pageUrl.match(Handler.jiraKeyMatcherInUrl);
      if (matches && matches.length > 0) {
        return matches[0];
      } else {
        Handler.notifyUser(
          'Jira Key not found'
          `The URL of the current tab does not contain a Jira key: ${info.pageUrl}`);
      }
    }
  }

  static determineUrl(info, key) {
    if (info.parentMenuItemId in Handler.jiraObjects) {
      const jiraObject = Handler.jiraObjects[info.parentMenuItemId];
      return jiraObject.determineUrl(info.menuItemId, key);
    }
  }

  static async handleOnClicked(info, tab) {
    if (!info) {
      return;
    }

    try {
      const detectedKey = Handler.detectKey(info);
      if (!detectedKey) {
        return;
      }

      const url = await Handler.determineUrl(info, detectedKey);
      if (!url) {
        return;
      }

      chrome.tabs.create({
        url,
        index: tab.index + 1,
      });
    } catch (e) {
      console.error(e);
      Handler.notifyUser(
        'Error',
        e.message);
    }
  }

  static createContextMenus(details) {
    if (details.reason === 'recreate-context-menus') {
      chrome.contextMenus.removeAll();
    }

    chrome.contextMenus.create({
      title: 'Open Jira',
      id: Handler.rootContextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    for (let jira in Handler.jiraObjects) {
      const jiraObject = Handler.jiraObjects[jira];
      jiraObject.createContextMenu();
    }

    if (details.reason === 'install') {
      chrome.storage.local.set({ jiras: Object.keys(Handler.jiraObjects) });
    }
  }

  static handleOnMessage(request, sender, sendResponse) {
    if (request.action === 'recreate-context-menus') {
      Handler.createContextMenus({ reason: 'recreate-context-menus' });
    }

    sendResponse({ action: 'done' });
  }
}

chrome.runtime.onInstalled.addListener(Handler.createContextMenus);
chrome.contextMenus.onClicked.addListener(Handler.handleOnClicked);
chrome.runtime.onMessage.addListener(Handler.handleOnMessage);
