export class CoverageData {
  constructor(
    public minCoveragePercentage: number,
    public coveragePercentage: number,
    public minCoverageReached: boolean
  ) {}

  public static updateCoverageData(): CoverageData {
    throw new Error("Method not implemented.");
  }
}
