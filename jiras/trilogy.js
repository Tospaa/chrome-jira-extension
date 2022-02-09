'use strict';
class TrilogyJira extends BaseJira {
  static url = 'https://trilogy-eng.atlassian.net';
  static contextMenuId = 'trilogy';
  static openSelectedContextMenuId = 'trilogy-jira-open-selected';
  static findTicketGivenLegacyContextMenuId = 'trilogy-find-ticket-given-legacy';
  static listFunctionalAreasContextMenuId = 'trilogy-list-functional-areas';
  static functionMap = {
    [this.openSelectedContextMenuId]: this.openSelected,
    [this.findTicketGivenLegacyContextMenuId]: this.findTicketGivenLegacy,
    [this.listFunctionalAreasContextMenuId]: this.listFunctionalAreas,
  };

  static createContextMenu() {
    chrome.contextMenus.create({
      title: 'Trilogy Jira',
      id: this.contextMenuId,
      parentId: Handler.rootContextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    chrome.contextMenus.create({
      title: 'Open in Trilogy Jira',
      id: this.openSelectedContextMenuId,
      parentId: this.contextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    chrome.contextMenus.create({
      title: 'Find ticket given legacy',
      id: this.findTicketGivenLegacyContextMenuId,
      parentId: this.contextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    chrome.contextMenus.create({
      title: 'List functional areas',
      id: this.listFunctionalAreasContextMenuId,
      parentId: this.contextMenuId,
      ...Handler.defaultContextMenuProps,
    });

    this.createContextMenuForCustomFunctions();
  }

  static openSelected(detectedKey) {
    return `${this.url}/browse/${detectedKey}`;
  }

  static findTicketGivenLegacy(detectedKey) {
    const jql = `"Legacy Issue Key[Short text]" ~ "${detectedKey}"`;
    return `${this.url}/issues/?jql=${encodeURI(jql)}`;
  }

  static listFunctionalAreas(detectedKey) {
    const projectKey = JiraKeyUtil.getProjectKeyFromIssueKey(detectedKey);
    const jql = `project = ${projectKey} and type = "Functional Area"`;
    return `${this.url}/issues/?jql=${encodeURI(jql)}`;
  }
}
