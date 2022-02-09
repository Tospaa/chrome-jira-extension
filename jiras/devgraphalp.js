'use strict';
class DevgraphAlpJira extends BaseJira {
  static url = 'https://devgraph-alp.atlassian.net';
  static contextMenuId = 'devgraphalp';
  static openSelectedContextMenuId = 'devgraphalp-open-selected';
  static findRelatedENGGContextMenuId = 'devgraphalp-find-related-engg';
  static functionMap = {
    [this.openSelectedContextMenuId]: this.openSelected,
    [this.findRelatedENGGContextMenuId]: this.findRelatedENGG,
  };

  static createContextMenu() {
    chrome.contextMenus.create({
      title: 'Devgraph ALP Jira',
      id: this.contextMenuId,
      parentId: Handler.rootContextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    chrome.contextMenus.create({
      title: 'Open in Devgraph ALP Jira',
      id: this.openSelectedContextMenuId,
      parentId: this.contextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    chrome.contextMenus.create({
      title: 'Find related ENGG',
      id: this.findRelatedENGGContextMenuId,
      parentId: this.contextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    this.createContextMenuForCustomFunctions();
  }

  static openSelected(detectedKey) {
    return `${this.url}/browse/${detectedKey}`;
  }

  static findRelatedENGG(detectedKey) {
    const jql = `"Work Data Structure Link[URL Field]" = "${TrilogyJira.url}/browse/${detectedKey}"`;
    return `${this.url}/issues/?jql=${encodeURI(jql)}`;
  }
}
