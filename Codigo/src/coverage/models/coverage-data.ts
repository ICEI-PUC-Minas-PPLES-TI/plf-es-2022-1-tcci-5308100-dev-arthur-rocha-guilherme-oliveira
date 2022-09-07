import { FileCoverage } from "../../file-coverage/models/file-coverage";
import { ProjectConfiguration } from "../../project-configuration/models/project-configuration";

export class CoverageData {
  public readonly minCoverageReached: boolean;

  constructor(
    public readonly minCoveragePercentage: number,
    public readonly coveragePercentage: number
  ) {
    this.minCoverageReached =
      this.coveragePercentage >= this.minCoveragePercentage;
  }

  public static updateCoverageData(
    fileCoverage: FileCoverage,
    projectConfiguration: ProjectConfiguration
  ): CoverageData {
    const coverageLines = fileCoverage.getLcovFiles();

    const coveredLines = coverageLines.reduce((acc, curr) => {
      return acc + curr.lines.hit;
    }, 0);

    const totalLines = coverageLines.reduce((acc, curr) => {
      return acc + curr.lines.found;
    }, 0);

    return new CoverageData(
      projectConfiguration.minCoverage,
      coveredLines / totalLines
    );
  }
}
