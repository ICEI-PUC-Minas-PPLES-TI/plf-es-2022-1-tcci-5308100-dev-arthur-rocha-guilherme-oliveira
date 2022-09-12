import { RangeLine } from "../../utils/models/line";
import { BranchDiff } from "../../version-control/models/branch-diff";

export class CoverageLines {
  constructor(
    public full: RangeLine[] = [],
    public partial: RangeLine[] = [],
    public none: RangeLine[] = []
  ) {}

  public static async createDiffCoverageLines(
    coverageLines: CoverageLines,
    branchDiff: BranchDiff
  ) {
    const filteredFull = await this.filterCoverageLines(
      coverageLines.full,
      branchDiff
    );

    const filteredPartial = await this.filterCoverageLines(
      coverageLines.partial,
      branchDiff
    );

    const filteredNone = await this.filterCoverageLines(
      coverageLines.none,
      branchDiff
    );

    return new CoverageLines(filteredFull, filteredPartial, filteredNone);
  }

  private static async filterCoverageLines(
    lines: RangeLine[],
    branchDiff: BranchDiff
  ) {
    return lines.filter((line) => {
      return branchDiff.diffLines.some((diffLine: RangeLine) => {
        return diffLine.equals(line);
      });
    });
  }
}
