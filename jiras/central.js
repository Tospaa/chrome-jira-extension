'use strict';
class CentralJira {
  static url = 'https://jira.devfactory.com';
  static contextMenuId = 'central';
  static openSelectedContextMenuId = 'central-open-selected';
  static functionMap = {
    [CentralJira.openSelectedContextMenuId]: CentralJira.openSelected,
  };

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

    CentralJira.createContextMenuForCustomFunctions();
  }

  static async getCustomFunctions() {
    const syncStorage = await chrome.storage.sync.get('customFunctions');
    if (syncStorage.customFunctions && CentralJira.contextMenuId in syncStorage.customFunctions) {
      return syncStorage.customFunctions[CentralJira.contextMenuId];
    }

    return {};
  }

  static async createContextMenuForCustomFunctions() {
    const customFunctions = await CentralJira.getCustomFunctions();
    for (let funcName in customFunctions) {
      const id = `${CentralJira.contextMenuId}-${funcName}`;
      chrome.contextMenus.create({
        title: funcName,
        id,
        parentId: CentralJira.contextMenuId,
        ...Handler.defaultContextMenuProps,
      });
    }
  }

  static determineUrl(menuItemId, detectedKey) {
    if (menuItemId in CentralJira.functionMap) {
      const func = CentralJira.functionMap[menuItemId];
      return func(detectedKey);
    }

    return CentralJira.customFunction(menuItemId, detectedKey);
  }

  static async customFunction(menuItemId, detectedKey) {
    const customFunctions = await CentralJira.getCustomFunctions();
    let func = undefined;
    for (let funcName in customFunctions) {
      const id = `${CentralJira.contextMenuId}-${funcName}`;
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
    return `${CentralJira.url}/issues/?jql=${encodeURI(finalJql)}`;
  }

  static openSelected(detectedKey) {
    return `${CentralJira.url}/browse/${detectedKey}`;
  }
}
