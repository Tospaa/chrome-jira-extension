'use strict';
class TrilogyJira {
  static url = 'https://trilogy-eng.atlassian.net';
  static contextMenuId = 'trilogy';
  static openSelectedContextMenuId = 'trilogy-jira-open-selected';
  static findTicketGivenLegacyContextMenuId = 'trilogy-find-ticket-given-legacy';
  static functionMap = {
    [TrilogyJira.openSelectedContextMenuId]: TrilogyJira.openSelected,
    [TrilogyJira.findTicketGivenLegacyContextMenuId]: TrilogyJira.findTicketGivenLegacy,
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
  }

  static determineUrl(menuItemId, detectedKey) {
    if (menuItemId in TrilogyJira.functionMap) {
      const func = TrilogyJira.functionMap[menuItemId];
      return func(detectedKey);
    }
  }

  static openSelected(detectedKey) {
    return `${TrilogyJira.url}/browse/${detectedKey}`;
  }

  static findTicketGivenLegacy(detectedKey) {
    const jql = `"Legacy Issue Key[Short text]" ~ "${detectedKey}"`;
    return `${TrilogyJira.url}/issues/?jql=${encodeURI(jql)}`;
  }
}
