'use strict';
class CustomFunctionJqlBuilder {
  projectApiMatcher = /(?:{projectApi\.)(?<placeholder>[A-Za-z0-9_\-\.]+?)(?:})/g;
  issueApiMatcher = /(?:{issueApi\.)(?<placeholder>[A-Za-z0-9_\-\.]+?)(?:})/g;
  constructor(customFunctionObject, jiraObject, detectedKey) {
    this.customFunctionObject = customFunctionObject;
    this.jiraObject = jiraObject;
    this.detectedKey = detectedKey;
    this.jql = this.customFunctionObject.jql;
    this.jiraProjectApiCallNeeded = this.jql.includes('{projectApi');
    this.jiraIssueApiCallNeeded = this.jql.includes('{issueApi');
  }

  async replaceAllApiPlaceholders() {
    if (this.jiraProjectApiCallNeeded || this.jiraIssueApiCallNeeded) {
      const promises = [];
      promises.push(this.jiraProjectApiPromise());
      promises.push(this.jiraIssueApiPromise());

      const results = await Promise.all(promises);
      const projectApiResponse = results[0];
      const issueApiResponse = results[1];

      await this.replaceJiraProjectApiPlaceholders(projectApiResponse);
      await this.replaceJiraIssueApiPlaceholders(issueApiResponse);
    }
  }

  jiraProjectApiPromise() {
    if (this.jiraProjectApiCallNeeded) {
      return fetch(`${this.jiraObject.url}/rest/api/2/project/${JiraKeyUtil.getProjectKeyFromIssueKey(this.detectedKey)}`);
    }

    return Promise.resolve({});
  }

  async replaceJiraProjectApiPlaceholders(projectApiResponse) {
    if (projectApiResponse.ok) {
      await this.replaceJiraApiPlaceholders(projectApiResponse, this.projectApiMatcher);
    }
  }

  jiraIssueApiPromise() {
    if (this.jiraIssueApiCallNeeded) {
      return fetch(`${this.jiraObject.url}/rest/api/2/issue/${this.detectedKey}`);
    }

    return Promise.resolve({});
  }

  async replaceJiraIssueApiPlaceholders(issueApiResponse) {
    if (issueApiResponse.ok) {
      await this.replaceJiraApiPlaceholders(issueApiResponse, this.issueApiMatcher);
    }
  }

  async replaceJiraApiPlaceholders(apiResponse, matcher) {
    const apiResponseJson = await apiResponse.json();

    this.jql = this.jql.replaceAll(matcher, (match, placeholder) => {
      let valueObject = apiResponseJson;

      for (const field of placeholder.split('.')) {
        if (valueObject[field] === undefined) {
          throw new Error(`Error while trying to find ${match} in the API response.`);
        }

        valueObject = valueObject[field] === null ? 'EMPTY' : valueObject[field];
      }

      if (typeof valueObject === 'object') {
        throw new Error(`Given placeholder '${match}' is an object, cannot be written to the JQL.`);
      }

      return valueObject;
    });
  }

  replaceCommonPlaceholders() {
    this.jql = this.jql
      .replace('{key}', this.detectedKey)
      .replace('{project}', JiraKeyUtil.getProjectKeyFromIssueKey(this.detectedKey));
  }

  async build() {
    await this.replaceAllApiPlaceholders();
    this.replaceCommonPlaceholders();
    return encodeURI(this.jql);
  }
}
