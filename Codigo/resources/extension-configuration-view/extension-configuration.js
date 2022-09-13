const isGutterActive = document.getElementById('isGutterActive');
const isBasedOnBranchChange = document.getElementById('isBasedOnBranchChange');
const messageBranch = document.getElementById('messageBranch');
const isJustForFileInFocus = document.getElementById('isJustForFileInFocus');

const vscode = acquireVsCodeApi();

function updateExtensionConfigurationData(extensionConfigurationData, isGitWorkspace) {
  isGutterActive.checked = extensionConfigurationData.isGutterActive;
  isJustForFileInFocus.checked = extensionConfigurationData.isJustForFileInFocus;
  isBasedOnBranchChange.checked = extensionConfigurationData.isBasedOnBranchChange;


  if (isGitWorkspace) {
    const message = "Avaliar com base na branch: " + extensionConfigurationData.referenceBranch;
    updateBrachHtmlLabel(message, false);
  } else {
    const message = ".git não encontrado";
    updateBrachHtmlLabel(message, true);
  }

  vscode.setState(extensionConfigurationData);
}

function updateBrachHtmlLabel(message, isDisabled) {
  isBasedOnBranchChange.disabled = isDisabled;
  messageBranch.innerHTML = message;
}

window.addEventListener('message', event => {

  const message = event.data;

  switch (message.type) {
    case 'extensionConfigurationData':
      updateExtensionConfigurationData(message.data, message.isGitWorkspace);
      break;
  }
});

const lastState = vscode.getState();
updateExtensionConfigurationData(lastState);

isGutterActive.addEventListener('change', () => {
  vscode.postMessage({
    command: 'toggleIsGutterActive',
  });
});

isBasedOnBranchChange.addEventListener('change', () => {
  vscode.postMessage({
    command: 'toggleIsBasedOnBranchChange',
  });
});

isJustForFileInFocus.addEventListener('change', () => {
  vscode.postMessage({
    command: 'toggleIsJustForFileInFocus',
  });
});