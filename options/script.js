async function getFunctions(jira) {
  const syncStorage = await chrome.storage.sync.get('customFunctions');
  if (syncStorage.customFunctions && jira in syncStorage.customFunctions) {
    return syncStorage.customFunctions[jira];
  }

  return {};
}

async function setFunctions(jira, functions) {
  const syncStorage = await chrome.storage.sync.get('customFunctions');
  if (!syncStorage.customFunctions) {
    syncStorage.customFunctions = {};
  }

  syncStorage.customFunctions[jira] = functions;
  await chrome.storage.sync.set({ customFunctions: syncStorage.customFunctions });
  chrome.runtime.sendMessage({ action: 'recreate-context-menus' }, function(response) {
    if (response.action !== 'done') {
      console.error('an error occured during context menu recreation', response.error);
    }
  });
}

function getFormDivElement(event) {
  return event.target.closest('section').querySelector('div.custom-function-form');
}

async function addEditFunction(event) {
  const div = getFormDivElement(event);
  const nameTextbox = div.querySelector('.name-textbox');
  const jqlTextbox = div.querySelector('.jql-textbox');
  const jira = div.dataset.jira;
  if (nameTextbox.value && jqlTextbox.value && jira) {
    const name = nameTextbox.value;
    const jql = jqlTextbox.value;
    const functions = await getFunctions(jira);
    functions[name] = {
      jql,
    };
    await setFunctions(jira, functions);
    listCustomFunctions();
  }
}

async function editLinkOnClick(event) {
  const div = getFormDivElement(event);
  const funcName = event.target.dataset.funcName;
  const nameTextbox = div.querySelector('.name-textbox');
  const jqlTextbox = div.querySelector('.jql-textbox');
  const button = div.querySelector('button');
  const jira = div.dataset.jira;
  const functions = await getFunctions(jira);
  nameTextbox.value = funcName;
  nameTextbox.disabled = true;
  jqlTextbox.value = functions[funcName].jql;
  button.textContent = 'Save';
}

async function deleteLinkOnClick(event) {
  const div = getFormDivElement(event);
  const funcName = event.target.dataset.funcName;
  const jira = div.dataset.jira;
  const functions = await getFunctions(jira);
  if (confirm(`Are you sure you want to delete the function "${funcName}"?`)) {
    delete functions[funcName];
    await setFunctions(jira, functions);
    listCustomFunctions();
  }
}

async function listCustomFunctions() {
  const localStorage = await chrome.storage.local.get('jiras');
  const jiras = localStorage.jiras;
  if (jiras) {
    const elem = document.getElementById('custom-functions');
    elem.innerHTML = '';
    for (let jira of jiras) {
      const section = document.createElement('section');
      const h2 = document.createElement('h2');
      h2.textContent = jira;
      section.appendChild(h2);
      const functions = await getFunctions(jira);
      if (Object.keys(functions).length > 0) {
        for (let funcName of Object.keys(functions)) {
          const div = document.createElement('div');
          const textElem = document.createElement('p');
          textElem.textContent = funcName;
          textElem.classList.add('custom-function-name');
          div.appendChild(textElem);
          const edit = document.createElement('a');
          edit.textContent = 'Edit';
          edit.classList.add('edit-delete-links');
          edit.href = '#';
          edit.dataset.funcName = funcName;
          edit.addEventListener('click', editLinkOnClick);
          div.appendChild(edit);
          const deleteLink = document.createElement('a');
          deleteLink.textContent = 'Delete';
          deleteLink.classList.add('edit-delete-links');
          deleteLink.href = '#';
          deleteLink.dataset.funcName = funcName;
          deleteLink.addEventListener('click', deleteLinkOnClick);
          div.appendChild(deleteLink);
          section.appendChild(div);
        }
      }

      section.appendChild(customFunctionFormElement(jira));
      elem.appendChild(section);
    }
  }
}

function customFunctionFormElement(jira) {
  const div = document.createElement('div');
  div.classList.add('custom-function-form');
  div.dataset.jira = jira;
  const nameTextbox = document.createElement('input');
  nameTextbox.type = 'text';
  nameTextbox.placeholder = 'Enter a name for this function';
  nameTextbox.classList.add('name-textbox');
  div.appendChild(nameTextbox);
  const jqlTextbox = document.createElement('input');
  jqlTextbox.type = 'text';
  jqlTextbox.placeholder = 'Enter a custom JQL';
  jqlTextbox.classList.add('jql-textbox');
  div.appendChild(jqlTextbox);
  const button = document.createElement('button');
  button.textContent = 'Add';
  button.addEventListener('click', addEditFunction);
  div.appendChild(button);
  return div;
}

listCustomFunctions();
