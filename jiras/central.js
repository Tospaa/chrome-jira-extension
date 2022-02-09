'use strict';
class CentralJira extends BaseJira {
  static url = 'https://jira.devfactory.com';
  static contextMenuId = 'central';
  static openSelectedContextMenuId = 'central-open-selected';
  static functionMap = {
    [this.openSelectedContextMenuId]: this.openSelected,
  };

  static createContextMenu() {
    chrome.contextMenus.create({
      title: 'Central Jira',
      id: this.contextMenuId,
      parentId: Handler.rootContextMenuId,
      ...Handler.defaultContextMenuProps,
    });
  
    chrome.contextMenus.create({
      title: 'Open in Central Jira',
      id: this.openSelectedContextMenuId,
      parentId: this.contextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    this.createContextMenuForCustomFunctions();
  }

  static openSelected(detectedKey) {
    return `${this.url}/browse/${detectedKey}`;
  }
}
