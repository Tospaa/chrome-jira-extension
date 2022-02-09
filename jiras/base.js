'use strict';
class BaseJira {
  static url = '';
  static contextMenuId = '';
  static openSelectedContextMenuId = '';
  static functionMap = {};

  static createContextMenu() {
    throw new Error('Not implemented');
  }

  static async getCustomFunctions() {
    const syncStorage = await chrome.storage.sync.get('customFunctions');
    if (syncStorage.customFunctions && this.contextMenuId in syncStorage.customFunctions) {
      return syncStorage.customFunctions[this.contextMenuId];
    }

    return {};
  }

  static async createContextMenuForCustomFunctions() {
    const customFunctions = await this.getCustomFunctions();
    for (let funcName in customFunctions) {
      const id = `${this.contextMenuId}-${funcName}`;
      chrome.contextMenus.create({
        title: funcName,
        id,
        parentId: this.contextMenuId,
        ...Handler.defaultContextMenuProps,
      });
    }
  }

  static determineUrl(menuItemId, detectedKey) {
    if (menuItemId in this.functionMap) {
      const func = this.functionMap[menuItemId];
      return func.call(this, detectedKey);
    }

    return this.customFunction(menuItemId, detectedKey);
  }

  static async customFunction(menuItemId, detectedKey) {
    const customFunctions = await this.getCustomFunctions();
    let func = undefined;
    for (let funcName in customFunctions) {
      const id = `${this.contextMenuId}-${funcName}`;
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
    return `${this.url}/issues/?jql=${encodeURI(finalJql)}`;
  }
}
