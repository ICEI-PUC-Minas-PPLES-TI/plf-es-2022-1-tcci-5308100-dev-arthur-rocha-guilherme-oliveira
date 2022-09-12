import { Uri } from "vscode";
import { normalizeFileName } from "../../utils/functions/helpers";
import { RangeLine } from "../../utils/models/line";
import { Line } from "./line";

export class File {
  public lines: Line[];
  public fileName: string;

  constructor(
    public uri: Uri,
    linesNotCovered: RangeLine[],
    linesPartiallyCovered: RangeLine[]
  ) {
    this.fileName = normalizeFileName(this.uri.fsPath).split("###").pop() || "";
    this.lines = [
      ...linesNotCovered.map((line) => new Line(this, line, "none")),
      ...linesPartiallyCovered.map((line) => new Line(this, line, "partial")),
    ].sort((a, b) => a.rangeLine.lineNumber - b.rangeLine.lineNumber);
  }
}
