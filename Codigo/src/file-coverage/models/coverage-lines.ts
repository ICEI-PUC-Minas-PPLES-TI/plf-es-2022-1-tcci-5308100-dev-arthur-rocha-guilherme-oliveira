import { Line } from "../../utils/Line";

export class CoverageLines {
  constructor(
    public full: Line[] = [],
    public partial: Line[] = [],
    public none: Line[] = []
  ) {}
}
