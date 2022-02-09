'use strict';
class JiraKeyUtil {
  static getProjectKeyFromIssueKey(detectedKey) {
    return detectedKey.split('-')[0];
  }
}
