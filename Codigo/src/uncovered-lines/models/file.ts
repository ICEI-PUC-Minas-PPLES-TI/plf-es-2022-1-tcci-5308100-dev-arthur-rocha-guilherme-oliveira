import { Line } from "./line";

export class File {
  public lines: Line[];

  constructor(public path: string, lines: number[]) {
    this.lines = lines.map((line) => new Line(this, line));
  }
}
