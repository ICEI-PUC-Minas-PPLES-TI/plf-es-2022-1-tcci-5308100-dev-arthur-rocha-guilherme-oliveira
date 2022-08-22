function formatNumber(num) {
  return Math.round(num * 100).toFixed(2);
}

const percentageElement = document.getElementById('percentage');
const minCoverageElement = document.getElementById('minCoveragePercentage');
const actualCoverageElement = document.getElementById('coveragePercentage');


const vscode = acquireVsCodeApi();

function updateCoverageData(coverageData) {
  if (coverageData.coveragePercentage < coverageData.minCoveragePercentage) {
    percentageElement.style.color = '#CC3E44';
  } else {
    percentageElement.style.color = '#8DC149';
  }

  minCoverageElement.innerHTML = formatNumber(coverageData.minCoveragePercentage);
  actualCoverageElement.innerHTML = formatNumber(coverageData.coveragePercentage);

  vscode.setState(coverageData);
}

window.addEventListener('message', event => {

  const message = event.data;

  switch (message.type) {
    case 'coverageData':
      updateCoverageData(message.data);
      break;
  }
});

const lastState = vscode.getState();
updateCoverageData(lastState);