import { ConfigurationData } from "../../extension-configuration/models/configuration-data";
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

  public static async updateCoverageData(
    fileCoverage: FileCoverage,
    projectConfiguration: ProjectConfiguration,
    extensionConfiguration: ConfigurationData
  ): Promise<CoverageData> {
    const coverageLines = await fileCoverage.getAllCoverageLines(
      extensionConfiguration.isBasedOnBranchChange
    );

    const coveredLines = coverageLines.reduce(
      (acc, curr) => acc + curr.full.length + curr.partial.length,
      0
    );

    const totalLines = coverageLines.reduce(
      (acc, curr) =>
        acc + curr.full.length + curr.partial.length + curr.none.length,
      0
    );

    return new CoverageData(
      projectConfiguration.minCoverage,
      coveredLines / totalLines
    );
  }
}
