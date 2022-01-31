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

    DevgraphAlpJira.createContextMenuForCustomFunctions();
  }

  static async getCustomFunctions() {
    const syncStorage = await chrome.storage.sync.get('customFunctions');
    if (syncStorage.customFunctions && DevgraphAlpJira.contextMenuId in syncStorage.customFunctions) {
      return syncStorage.customFunctions[DevgraphAlpJira.contextMenuId];
    }

    return {};
  }

  static async createContextMenuForCustomFunctions() {
    const customFunctions = await DevgraphAlpJira.getCustomFunctions();
    for (let funcName in customFunctions) {
      const id = `${DevgraphAlpJira.contextMenuId}-${funcName}`;
      chrome.contextMenus.create({
        title: funcName,
        id,
        parentId: DevgraphAlpJira.contextMenuId,
        ...Handler.defaultContextMenuProps,
      });
    }
  }

  static determineUrl(menuItemId, detectedKey) {
    if (menuItemId in DevgraphAlpJira.functionMap) {
      const func = DevgraphAlpJira.functionMap[menuItemId];
      return func(detectedKey);
    }

    return DevgraphAlpJira.customFunction(menuItemId, detectedKey);
  }

  static async customFunction(menuItemId, detectedKey) {
    const customFunctions = await DevgraphAlpJira.getCustomFunctions();
    let func = undefined;
    for (let funcName in customFunctions) {
      const id = `${DevgraphAlpJira.contextMenuId}-${funcName}`;
      if (id === menuItemId) {
        func = customFunctions[funcName];
        break;
      }
    }

    if (!func) {
      throw new Error(`No custom function found for menu item id ${menuItemId}`);
    }

    const finalJql = func.jql
      .replace('{key}', detectedKey)
      .replace('{project}', detectedKey.split('-')[0]);
    return `${DevgraphAlpJira.url}/issues/?jql=${encodeURI(finalJql)}`;
  }

  static openSelected(detectedKey) {
    return `${DevgraphAlpJira.url}/browse/${detectedKey}`;
  }

  static findRelatedENGG(detectedKey) {
    const jql = `"Work Data Structure Link[URL Field]" = "${TrilogyJira.url}/browse/${detectedKey}"`;
    return `${DevgraphAlpJira.url}/issues/?jql=${encodeURI(jql)}`;
  }
}
