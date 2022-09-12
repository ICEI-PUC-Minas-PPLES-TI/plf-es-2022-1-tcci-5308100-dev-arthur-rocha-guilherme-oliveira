import { RangeLine } from "../../utils/models/line";
import { File } from "./file";

export class Line {
  constructor(
    public readonly parentFile: File,
    public readonly rangeLine: RangeLine,
    public readonly coverageStatus: "none" | "partial" | "full"
  ) {}
}
