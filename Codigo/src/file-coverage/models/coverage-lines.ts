import { Line } from "../../utils/models/line";
import { BranchDiff } from "../../version-control/models/branch-diff";

export class CoverageLines {
  constructor(
    public full: Line[] = [],
    public partial: Line[] = [],
    public none: Line[] = []
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
    lines: Line[],
    branchDiff: BranchDiff
  ) {
    return lines.filter((line) => {
      return branchDiff.diffLines.some((diffLine: Line) => {
        return Line.equals(diffLine, line);
      });
    });
  }
}
