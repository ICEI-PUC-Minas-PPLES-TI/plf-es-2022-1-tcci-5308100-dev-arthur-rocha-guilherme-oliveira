import { readFile } from "fs";
import { window, workspace } from "vscode";

export class ProjectConfiguration {
  public static readonly DEFAULT_FILE_NAME = ".coveringconfig";
  public static readonly MINIMUM_COVERAGE_DEFAULT_VALUE = 0.8;

  public readonly lcovFilePath?: string;
  public readonly minCoverage: number;
  public readonly refBranch?: string;
  public readonly runTestCoverage?: string;
  public readonly runTestCoverageWatchMode?: string;
  public readonly usePrePushValidation: boolean;

  constructor(private readonly data: any = {}) {
    this.lcovFilePath = data["lcovFilePath"];

    this.minCoverage = this.validateNullableValueWithDefault<number>(
      data["minCoverage"],
      ProjectConfiguration.MINIMUM_COVERAGE_DEFAULT_VALUE,
      [this.getMinCoverageRangeValidation]
    );

    this.refBranch = data["refBranch"] || "main";
    this.runTestCoverage = data["runTestCoverage"];
    this.runTestCoverageWatchMode = data["runTestCoverageWatchMode"];

    this.usePrePushValidation = this.validateNullableValueWithDefault<boolean>(
      data["usePrePushValidation"],
      false
    );
  }

  private getMinCoverageRangeValidation(value: number): {
    isValid: boolean;
    message: string;
  } {
    if (value < 0 || value > 1) {
      return {
        isValid: false,
        message: `Invalid value for minCoverage in ${ProjectConfiguration.DEFAULT_FILE_NAME}. It must be between 0 and 1.`,
      };
    }
    return { isValid: true, message: "" };
  }

  private validateNullableValueWithDefault<T extends string | number | boolean>(
    value: any,
    defaultValue: T,
    extraValidations?: Array<
      (value: T) => { isValid: boolean; message: string }
    >
  ): T {
    const defaultType = typeof defaultValue;
    if (typeof value === defaultType) {
      if (extraValidations) {
        const validations = extraValidations.map((validation) =>
          validation(value)
        );
        for (const { isValid, message } of validations) {
          if (!isValid) {
            window.showErrorMessage(message);
          }
        }
        if (validations.some((validation) => !validation.isValid)) {
          return defaultValue;
        }
      }
      return value;
    }

    if (value !== undefined && value !== null) {
      window.showErrorMessage(
        `Invalid value for minCoverage in ${ProjectConfiguration.DEFAULT_FILE_NAME}. It must be a ${defaultType} or null.`
      );
    }

    return defaultValue;
  }

  public static async createNewConfiguration(): Promise<ProjectConfiguration> {
    const fileContent = await ProjectConfiguration.getFileData();

    if (!fileContent) {
      return new ProjectConfiguration();
    }

    try {
      const parsedData = JSON.parse(fileContent);
      return new ProjectConfiguration(parsedData);
    } catch (e: any) {
      if (typeof e === "string") {
        window.showErrorMessage(e);
      }

      if (e instanceof SyntaxError) {
        window.showErrorMessage(e.message);
      }

      return new ProjectConfiguration();
    }
  }

  private static getFileData(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!workspace.workspaceFolders) {
        return resolve(null);
      }

      const rootPath = workspace.workspaceFolders[0].uri.fsPath;
      const filePath = `${rootPath}/${this.DEFAULT_FILE_NAME}`;
      readFile(filePath, (err, data) => {
        if (err) {
          return resolve(null);
        }
        return resolve(data.toString());
      });
    });
  }
}
