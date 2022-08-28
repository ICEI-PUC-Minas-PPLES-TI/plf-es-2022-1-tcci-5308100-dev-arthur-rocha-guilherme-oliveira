import { FileCoverage } from "../../file-coverage/models/file-coverage";

export class CoverageData {
  public readonly minCoverageReached: boolean;

  constructor(
    public readonly minCoveragePercentage: number,
    public readonly coveragePercentage: number
  ) {
    this.minCoverageReached =
      this.coveragePercentage >= this.minCoveragePercentage;
  }

  public static updateCoverageData(fileCoverage: FileCoverage): CoverageData {
    const coverageLines = fileCoverage.getLcovFiles();

    const coveredLines = coverageLines.reduce((acc, curr) => {
      return acc + curr.lines.hit;
    }, 0);

    const totalLines = coverageLines.reduce((acc, curr) => {
      return acc + curr.lines.found;
    }, 0);

    return new CoverageData(0.8, coveredLines / totalLines);
  }
}
