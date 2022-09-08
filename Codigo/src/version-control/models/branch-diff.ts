import { Line } from "../../utils/models/line";

export class BranchDiff {
  constructor(public fileName: string, public diffLines: Line[]) {}
}
