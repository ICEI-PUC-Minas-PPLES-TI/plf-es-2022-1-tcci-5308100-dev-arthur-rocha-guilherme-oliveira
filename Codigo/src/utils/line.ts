import { Range } from "vscode";

export class Line extends Range {
  constructor(lineNumber: number) {
    super(lineNumber, 0, lineNumber, 0);
  }

  public static equals(data1: Line, data2: Line): boolean {
    return data1.start.line === data2.start.line;
  }
}
