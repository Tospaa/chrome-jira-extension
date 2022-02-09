# How to add a Custom Function?

You can add a custom function and use it in the extension now. Follow these steps

1. Go to Chrome extensions page (chrome://extensions)
1. Click on the "Details" button of the "Jira Quick Access" extension
1. Click on the "Extension options" button. The options page should appear
1. Decide where (which Jira) to add the new custom function
1. Decide a name for the function, and add a corresponding JQL for the function
1. Click on the "Add" button

## Which placeholders are supported?

You can use these placeholders to replace with the detected values in your JQL

| Placeholder | Replaced value | Example |
| --- | --- | --- |
| `{key}` | The detected key of your selection | If you use the JQL `key in ({key})` and use the extension on the page https://devgraph-alp.atlassian.net/browse/ENGG-42284, the final JQL will be `key in (ENGG-42284)` |
| `{project}` | The detected project key of your Jira key selection | If you use the JQL `project = {project} and assignee = ascheduler` and use the extension on the page https://trilogy-eng.atlassian.net/browse/SCLOOPW-29875, the final JQL will be `project = SCLOOPW and assignee = ascheduler` |
| `{issueApi.<your-key>}` | Use the Jira Issue API response for your key | If you use the JQL `project = {project} and type = "{issueApi.fields.issuetype.name}" and status = "{issueApi.fields.status.name}"` and use the extension on the page https://trilogy-eng.atlassian.net/browse/SCLOOPW-30402, the final JQL will be `project = SCLOOPW and type = "Customer Defect" and status = "Review the Fix"` |
| `{projectApi.<your-key>}` | Use the Jira Project API response for your key | If you use the JQL `project = {project} and reporter = {projectApi.lead.accountId}` and use the extension on the page https://trilogy-eng.atlassian.net/browse/SBM-79606, the final JQL will be `project = SBM and reporter = 5c125a9c0ecb4f1b2ffaddca` |

