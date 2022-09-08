import { Line } from "../../utils/models/line";

export class CoverageLines {
  constructor(
    public full: Line[] = [],
    public partial: Line[] = [],
    public none: Line[] = []
  ) {}
}
