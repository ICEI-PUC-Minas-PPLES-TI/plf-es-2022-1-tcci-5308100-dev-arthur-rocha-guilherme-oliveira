import { normalizeFileName } from "../../utils/functions/helpers";
import { RangeLine } from "../../utils/models/line";

export class BranchDiff {
  constructor(public fileName: string, public diffLines: RangeLine[]) {}

  public static createBranchDiffFileLines(
    diffArray: string[],
    fileName: string
  ): BranchDiff {
    let lines: RangeLine[] = [];

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
                lines.push(new RangeLine(startLine + i));
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
    const fsPatch = diff.split("\n")[0].split(" ")[1].replace("b/", "");
    const normalizedFsPatch = normalizeFileName(fsPatch);
    const normalizedFileName = normalizeFileName(fileName);

    if (normalizedFileName.length > normalizedFsPatch.length) {
      return normalizedFileName.match(normalizedFsPatch);
    }
    return normalizedFsPatch.match(normalizedFileName);
  }
}
