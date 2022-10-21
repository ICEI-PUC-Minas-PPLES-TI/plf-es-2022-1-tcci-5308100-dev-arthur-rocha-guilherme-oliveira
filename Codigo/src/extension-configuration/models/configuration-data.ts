export class ConfigurationData {
  constructor(
    public isGutterActive: boolean,

    public isBasedOnBranchChange: boolean,

    public referenceBranch: string,

    public isJustForFileInFocus: boolean,

    public runTestCoverage: string
  ) {}

  public static updateConfigurationData(
    actual: ConfigurationData,
    newFields: Partial<ConfigurationData>
  ): ConfigurationData {
    const {
      isGutterActive,
      isBasedOnBranchChange,
      referenceBranch,
      isJustForFileInFocus,
      runTestCoverage,
    } = actual;

    const {
      isGutterActive: newIsGutterActive,
      isBasedOnBranchChange: newIsBasedOnBranchChange,
      referenceBranch: newReferenceBranch,
      isJustForFileInFocus: newIsJustForFileInFocus,
      runTestCoverage: newRunTestCoverage,
    } = newFields;

    return new ConfigurationData(
      newIsGutterActive !== undefined ? newIsGutterActive : isGutterActive,

      newIsBasedOnBranchChange !== undefined
        ? newIsBasedOnBranchChange
        : isBasedOnBranchChange,

      newReferenceBranch !== undefined ? newReferenceBranch : referenceBranch,

      newIsJustForFileInFocus !== undefined
        ? newIsJustForFileInFocus
        : isJustForFileInFocus,

      newRunTestCoverage !== undefined ? newRunTestCoverage : runTestCoverage
    );
  }
}
