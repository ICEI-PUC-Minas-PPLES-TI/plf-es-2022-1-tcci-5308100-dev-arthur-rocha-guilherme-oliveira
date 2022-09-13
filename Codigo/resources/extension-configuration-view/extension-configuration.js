const isGutterActive = document.getElementById('isGutterActive');
const isBasedOnBranchChange = document.getElementById('isBasedOnBranchChange');
const messageBranch = document.getElementById('messageBranch');
const isJustForFileInFocus = document.getElementById('isJustForFileInFocus');

const vscode = acquireVsCodeApi();

function updateExtensionConfigurationData(extensionConfigurationData, isGitWorkspace) {
  isGutterActive.checked = extensionConfigurationData.isGutterActive;
  isJustForFileInFocus.checked = extensionConfigurationData.isJustForFileInFocus;

  if (isGitWorkspace) {
    isBasedOnBranchChange.checked = extensionConfigurationData.isBasedOnBranchChange;
    isBasedOnBranchChange.disabled = false;
    messageBranch.innerHTML = "Avaliar com base na branch: " + extensionConfigurationData.referenceBranchsage;
  } else {
    isBasedOnBranchChange.checked = extensionConfigurationData.isBasedOnBranchChange;
    isBasedOnBranchChange.disabled = true;
    messageBranch.innerHTML = ".git não encontrado";
  }

  vscode.setState(extensionConfigurationData);
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