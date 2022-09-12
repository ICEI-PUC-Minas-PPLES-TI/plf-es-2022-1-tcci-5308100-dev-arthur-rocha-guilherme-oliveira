import { Range } from "vscode";

export class RangeLine extends Range {
  constructor(public readonly lineNumber: number) {
    super(lineNumber - 1, 0, lineNumber - 1, 0);
  }

  public equals(data: RangeLine): boolean {
    return this.start.line === data.start.line;
  }
}
