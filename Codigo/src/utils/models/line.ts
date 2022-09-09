import { Range } from "vscode";

export class Line extends Range {
  constructor(lineNumber: number) {
    super(lineNumber, 0, lineNumber, 0);
  }

  public equals(data: Line): boolean {
    return this.start.line === data.start.line;
  }
}
