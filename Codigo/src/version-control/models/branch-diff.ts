import { Line } from "../../utils/Line";

export class BranchDiff {
  constructor(public fileName: string, public diffLines: Line[]) {}
}
