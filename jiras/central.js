'use strict';
class CentralJira {
  static url = 'https://jira.devfactory.com';
  static contextMenuId = 'central';
  static openSelectedContextMenuId = 'central-open-selected';

  static createContextMenu() {
    chrome.contextMenus.create({
      title: 'Central Jira',
      id: CentralJira.contextMenuId,
      parentId: Handler.rootContextMenuId,
      ...Handler.defaultContextMenuProps,
    });
  
    chrome.contextMenus.create({
      title: 'Open in Central Jira',
      id: CentralJira.openSelectedContextMenuId,
      parentId: CentralJira.contextMenuId,
      ...Handler.defaultContextMenuProps,
    });
  }

  static determineUrl(menuItemId, detectedKey) {
    if (menuItemId === CentralJira.openSelectedContextMenuId) {
      return `${CentralJira.url}/browse/${detectedKey}`;
    }
  }
}
