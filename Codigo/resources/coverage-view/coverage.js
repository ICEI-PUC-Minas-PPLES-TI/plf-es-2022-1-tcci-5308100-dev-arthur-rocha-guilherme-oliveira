function formatNumber(num) {
  return (num * 100).toFixed(2);
}

const percentageElement = document.getElementById('percentage');
const minCoverageElement = document.getElementById('minCoveragePercentage');
const actualCoverageElement = document.getElementById('coveragePercentage');
const coverageResult = document.getElementById('coverageResult');


const vscode = acquireVsCodeApi();

function updateCoverageData(coverageData) {
  updateHtmlContent(coverageData);

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

vscode.postMessage({
  command: 'startingView',
});

function updateHtmlContent(coverageData) {
  minCoverageElement.innerHTML = formatNumber(coverageData.minCoveragePercentage);

  if (coverageData.coveragePercentage === undefined) {
    noLinesToCover();
    return;
  }

  actualCoverageElement.innerHTML = formatNumber(coverageData.coveragePercentage);

  if (coverageData.minCoverageReached) {
    percentageElement.style.color = '#8DC149';
    coverageResult.innerHTML = 'Você alcançou o mínimo definido';
  } else {
    percentageElement.style.color = '#CC3E44';
    coverageResult.innerHTML = 'Você ainda não alcançou o mínimo';
  }
}

function noLinesToCover() {
  actualCoverageElement.innerHTML = '-';
  percentageElement.style.color = '';
  coverageResult.innerHTML = 'Nenhuma linha para cobrir';
}

