import { File } from "./file";

export class Line {
  constructor(public parentFile: File, public number: number) {}
}
