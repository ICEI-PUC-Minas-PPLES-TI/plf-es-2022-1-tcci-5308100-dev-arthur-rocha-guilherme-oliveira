import { Range } from "vscode";

export class CoverageLines {
  constructor(
    public full: Range[] = [],
    public partial: Range[] = [],
    public none: Range[] = []
  ) {}
}

