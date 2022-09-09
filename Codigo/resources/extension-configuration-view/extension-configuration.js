const isGutterActive = document.getElementById('isGutterActive');
const isBasedOnBranchChange = document.getElementById('isBasedOnBranchChange');
const referenceBranch = document.getElementById('referenceBranch');
const isJustForFileInFocus = document.getElementById('isJustForFileInFocus');

const vscode = acquireVsCodeApi();

function updateExtensionConfigurationData(extensionConfigurationData) {
  isGutterActive.checked = extensionConfigurationData.isGutterActive;
  isBasedOnBranchChange.checked = extensionConfigurationData.isBasedOnBranchChange;
  referenceBranch.innerHTML = extensionConfigurationData.referenceBranch;
  isJustForFileInFocus.checked = extensionConfigurationData.isJustForFileInFocus;

  vscode.setState(extensionConfigurationData);
}


window.addEventListener('message', event => {

  const message = event.data;

  switch (message.type) {
    case 'extensionConfigurationData':
      updateExtensionConfigurationData(message.data);
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
