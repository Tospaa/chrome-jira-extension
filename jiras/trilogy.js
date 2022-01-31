'use strict';
class TrilogyJira {
  static url = 'https://trilogy-eng.atlassian.net';
  static contextMenuId = 'trilogy';
  static openSelectedContextMenuId = 'trilogy-jira-open-selected';
  static findTicketGivenLegacyContextMenuId = 'trilogy-find-ticket-given-legacy';
  static listFunctionalAreasContextMenuId = 'trilogy-list-functional-areas';
  static functionMap = {
    [TrilogyJira.openSelectedContextMenuId]: TrilogyJira.openSelected,
    [TrilogyJira.findTicketGivenLegacyContextMenuId]: TrilogyJira.findTicketGivenLegacy,
    [TrilogyJira.listFunctionalAreasContextMenuId]: TrilogyJira.listFunctionalAreas,
  };

  static createContextMenu() {
    chrome.contextMenus.create({
      title: 'Trilogy Jira',
      id: TrilogyJira.contextMenuId,
      parentId: Handler.rootContextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    chrome.contextMenus.create({
      title: 'Open in Trilogy Jira',
      id: TrilogyJira.openSelectedContextMenuId,
      parentId: TrilogyJira.contextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    chrome.contextMenus.create({
      title: 'Find ticket given legacy',
      id: TrilogyJira.findTicketGivenLegacyContextMenuId,
      parentId: TrilogyJira.contextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    chrome.contextMenus.create({
      title: 'List functional areas',
      id: TrilogyJira.listFunctionalAreasContextMenuId,
      parentId: TrilogyJira.contextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    TrilogyJira.createContextMenuForCustomFunctions();
  }

  static async getCustomFunctions() {
    const syncStorage = await chrome.storage.sync.get('customFunctions');
    if (syncStorage.customFunctions && TrilogyJira.contextMenuId in syncStorage.customFunctions) {
      return syncStorage.customFunctions[TrilogyJira.contextMenuId];
    }

    return {};
  }

  static async createContextMenuForCustomFunctions() {
    const customFunctions = await TrilogyJira.getCustomFunctions();
    for (let funcName in customFunctions) {
      const id = `${TrilogyJira.contextMenuId}-${funcName}`;
      chrome.contextMenus.create({
        title: funcName,
        id,
        parentId: TrilogyJira.contextMenuId,
        ...Handler.defaultContextMenuProps,
      });
    }
  }

  static determineUrl(menuItemId, detectedKey) {
    if (menuItemId in TrilogyJira.functionMap) {
      const func = TrilogyJira.functionMap[menuItemId];
      return func(detectedKey);
    }

    return TrilogyJira.customFunction(menuItemId, detectedKey);
  }

  static async customFunction(menuItemId, detectedKey) {
    const customFunctions = await TrilogyJira.getCustomFunctions();
    let func = undefined;
    for (let funcName in customFunctions) {
      const id = `${TrilogyJira.contextMenuId}-${funcName}`;
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
    return `${TrilogyJira.url}/issues/?jql=${encodeURI(finalJql)}`;
  }

  static openSelected(detectedKey) {
    return `${TrilogyJira.url}/browse/${detectedKey}`;
  }

  static findTicketGivenLegacy(detectedKey) {
    const jql = `"Legacy Issue Key[Short text]" ~ "${detectedKey}"`;
    return `${TrilogyJira.url}/issues/?jql=${encodeURI(jql)}`;
  }

  static listFunctionalAreas(detectedKey) {
    const projectKey = detectedKey.split('-')[0];
    const jql = `project = ${projectKey} and type = "Functional Area"`;
    return `${TrilogyJira.url}/issues/?jql=${encodeURI(jql)}`;
  }
}
