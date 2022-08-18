(() => {
  function formatNumber(num) {
    return Math.round(num * 100).toFixed(2);
  }

  const percentageElement = document.getElementById('percentage');
  const minCoverageElement = document.getElementById('minCoverage');
  const actualCoverageElement = document.getElementById('actualCoverage');


  const vscode = acquireVsCodeApi();

  function updateCoverageData(state) {
    if (state.actualCoverage < state.minCoverage) {
      percentageElement.style.color = '#CC3E44';
    } else {
      percentageElement.style.color = '#8DC149';
    }

    minCoverageElement.innerHTML = formatNumber(state.minCoverage);
    actualCoverageElement.innerHTML = formatNumber(state.actualCoverage);
    vscode.setState(state);
  }

  const oldState = vscode.getState() || { minCoverage: 0.8, actualCoverage: 0.9 };

  updateCoverageData(oldState);

  percentageElement.addEventListener('click', () => {
    const state = vscode.getState();
    if (state.actualCoverage < state.minCoverage) {
      updateCoverageData({ minCoverage: 0.8, actualCoverage: 0.9750 });
    } else {
      updateCoverageData({ minCoverage: 0.8, actualCoverage: 0.3333 });
    }
  })
})();

