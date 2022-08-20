import { FileCoverage } from "../../file-coverage/models/file-coverage";

export class CoverageData {
  constructor(
    public minCoveragePercentage: number,
    public coveragePercentage: number,
    public minCoverageReached: boolean
  ) {}

  public static updateCoverageData(fileCoverage: FileCoverage): CoverageData {
    fileCoverage.getLcovFiles();

    return new CoverageData(0.8, 0.4567, false);
  }
}
