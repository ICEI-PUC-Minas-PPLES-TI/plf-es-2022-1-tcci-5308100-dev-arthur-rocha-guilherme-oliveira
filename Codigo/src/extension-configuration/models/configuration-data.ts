import { CoverageData } from "../../coverage/models/coverage-data";

export class ConfigurationData {
  constructor(
    public isGutterActive: boolean,

    public isBasedOnBranchChange: boolean,

    public referenceBranch: string,

    public isJustForFileInFocus: boolean
  ) {}

  public static updateConfigurationData(): CoverageData {
    throw new Error("Method not implemented.");
  }
}
