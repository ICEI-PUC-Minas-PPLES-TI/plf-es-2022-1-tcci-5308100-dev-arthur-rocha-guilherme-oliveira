(() => {
  function formatNumber(num) {
    return Math.round(num * 100).toFixed(2);
  }

  const percentageElement = document.getElementById('percentage');
  const minCoverageElement = document.getElementById('minCoveragePercentage');
  const actualCoverageElement = document.getElementById('coveragePercentage');


  const vscode = acquireVsCodeApi();

  function updateCoverageData(state) {
    if (state.coveragePercentage < state.minCoveragePercentage) {
      percentageElement.style.color = '#CC3E44';
    } else {
      percentageElement.style.color = '#8DC149';
    }

    minCoverageElement.innerHTML = formatNumber(state.minCoveragePercentage);
    actualCoverageElement.innerHTML = formatNumber(state.coveragePercentage);
    vscode.setState(state);
  }

  window.addEventListener('message', event => {

    const message = event.data;

    switch (message.type) {
      case 'coverageData':
        updateCoverageData(message.data);
        break;
    }
  });
})();

