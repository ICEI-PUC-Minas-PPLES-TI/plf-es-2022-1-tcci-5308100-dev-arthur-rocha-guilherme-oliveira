import { normalizeFileName } from "../../utils/functions/helpers";
import { Line } from "../../utils/models/line";

export class BranchDiff {
  constructor(public fileName: string, public diffLines: Line[]) {}

  public static createBranchDiffFileLines(
    diffArray: string[],
    fileName: string
  ): BranchDiff {
    let lines: Line[] = [];

    for (const diff of diffArray) {
      if (diff.length) {
        if (this.isSameDiffFile(diff, fileName)) {
          diff.split("\n").forEach((line) => {
            if (line.startsWith("@@")) {
              const diffLinesNumbers = line
                .split(" ")[2]
                .replace("+", "")
                .split(",");
              const startLine = Number(diffLinesNumbers[0]);
              const endLine = Number(diffLinesNumbers[1] || 1);

              for (let i = 0; i < endLine; i++) {
                lines.push(new Line(startLine + i));
              }
            }
          });

          break;
        }
      }
    }

    return new BranchDiff(fileName, lines);
  }

  private static isSameDiffFile(diff: string, fileName: string) {
    let fsPatch = diff.split("\n")[0].split(" ")[0];
    fsPatch = normalizeFileName(fsPatch);

    return normalizeFileName(fileName).match(fsPatch);
  }
}
