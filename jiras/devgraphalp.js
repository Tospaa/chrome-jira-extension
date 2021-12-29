'use strict';
class DevgraphAlpJira {
  static url = 'https://devgraph-alp.atlassian.net';
  static contextMenuId = 'devgraphalp';
  static openSelectedContextMenuId = 'devgraphalp-open-selected';
  static findRelatedENGGContextMenuId = 'devgraphalp-find-related-engg';
  static functionMap = {
    [DevgraphAlpJira.openSelectedContextMenuId]: DevgraphAlpJira.openSelected,
    [DevgraphAlpJira.findRelatedENGGContextMenuId]: DevgraphAlpJira.findRelatedENGG,
  };

  static createContextMenu() {
    chrome.contextMenus.create({
      title: 'Devgraph ALP Jira',
      id: DevgraphAlpJira.contextMenuId,
      parentId: Handler.rootContextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    chrome.contextMenus.create({
      title: 'Open in Devgraph ALP Jira',
      id: DevgraphAlpJira.openSelectedContextMenuId,
      parentId: DevgraphAlpJira.contextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    chrome.contextMenus.create({
      title: 'Find related ENGG',
      id: DevgraphAlpJira.findRelatedENGGContextMenuId,
      parentId: DevgraphAlpJira.contextMenuId,
      ...Handler.defaultContextMenuProps,
    });
  }

  static determineUrl(menuItemId, detectedKey) {
    if (menuItemId in DevgraphAlpJira.functionMap) {
      const func = DevgraphAlpJira.functionMap[menuItemId];
      return func(detectedKey);
    }
  }

  static openSelected(detectedKey) {
    return `${DevgraphAlpJira.url}/browse/${detectedKey}`;
  }

  static findRelatedENGG(detectedKey) {
    const jql = `"Work Data Structure Link[URL Field]" = "${TrilogyJira.url}/browse/${detectedKey}"`;
    return `${DevgraphAlpJira.url}/issues/?jql=${encodeURI(jql)}`;
  }
}
