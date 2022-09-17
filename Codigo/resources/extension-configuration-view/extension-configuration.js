const isGutterActive = document.getElementById('isGutterActive');
const isBasedOnBranchChange = document.getElementById('isBasedOnBranchChange');
const messageBranch = document.getElementById('messageBranch');
const refBranch = document.getElementById('referenceBranch');
const isJustForFileInFocus = document.getElementById('isJustForFileInFocus');

const vscode = acquireVsCodeApi();

function updateExtensionConfigurationData(extensionConfigurationData, isGitWorkspace) {
  isGutterActive.checked = extensionConfigurationData.isGutterActive;
  isJustForFileInFocus.checked = extensionConfigurationData.isJustForFileInFocus;
  isBasedOnBranchChange.checked = extensionConfigurationData.isBasedOnBranchChange;

  if (isGitWorkspace) {
    const message = "Avaliar com base na branch: ";
    updateBrachHtmlLabel(message, false, extensionConfigurationData.referenceBranch);
  } else {
    const message = ".git não encontrado";
    updateBrachHtmlLabel(message, true, extensionConfigurationData.referenceBranch);
  }

  vscode.setState({ extensionConfigurationData, isGitWorkspace });
}

function updateBrachHtmlLabel(message, isDisabled, referenceBranch) {
  isBasedOnBranchChange.disabled = isDisabled;
  messageBranch.innerText = message;
  refBranch.innerText = referenceBranch;

}

window.addEventListener('message', event => {

  const message = event.data;

  switch (message.type) {
    case 'extensionConfigurationData':
      updateExtensionConfigurationData(message.data, message.isGitWorkspace);
      break;
  }
});

const { extensionConfigurationData, isGitWorkspace } = vscode.getState();
updateExtensionConfigurationData(extensionConfigurationData, isGitWorkspace);

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