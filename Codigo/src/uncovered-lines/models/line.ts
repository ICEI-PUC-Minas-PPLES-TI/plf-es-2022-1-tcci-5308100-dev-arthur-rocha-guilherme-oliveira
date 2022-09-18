import { RangeLine } from "../../utils/models/range-line";
import { LineCoverageStatus } from "../enums/line-coverage-status.enum";
import { File } from "./file";

export class Line {
  constructor(
    public readonly parentFile: File,
    public readonly rangeLine: RangeLine,
    public readonly coverageStatus: LineCoverageStatus
  ) {}
}
