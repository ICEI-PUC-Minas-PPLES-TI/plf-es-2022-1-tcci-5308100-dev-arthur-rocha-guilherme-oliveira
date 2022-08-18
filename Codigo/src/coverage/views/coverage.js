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

  const oldState = vscode.getState() || { minCoveragePercentage: 0.8, coveragePercentage: 0.9 };

  updateCoverageData(oldState);

  percentageElement.addEventListener('click', () => {
    const state = vscode.getState();
    if (state.coveragePercentage < state.minCoveragePercentage) {
      updateCoverageData({ minCoveragePercentage: 0.8, coveragePercentage: 0.9750 });
    } else {
      updateCoverageData({ minCoveragePercentage: 0.8, coveragePercentage: 0.3333 });
    }
  })
})();

