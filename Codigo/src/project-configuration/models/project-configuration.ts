import { readFile } from "fs";
import { Uri, window, workspace } from "vscode";
import { FileCoverage } from "../../file-coverage/models/file-coverage";

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export class ProjectConfiguration {
  public static readonly DEFAULT_FILE_NAME = ".coveringconfig";
  public static readonly MINIMUM_COVERAGE_DEFAULT_VALUE = 0.8;
  public static readonly DEFAULT_LCOV_FILE_NAME =
    FileCoverage.DEFAULT_LCOV_FILE_NAME;

  public readonly lcovFileName: string;
  public readonly minCoverage: number;
  public readonly refBranch?: string;
  public readonly runTestCoverage?: string;
  public readonly usePrePushValidation: boolean;

  constructor(data: any = {}) {
    this.lcovFileName = this.validateNullableValueWithDefault(
      data,
      "lcovFileName",
      ProjectConfiguration.DEFAULT_LCOV_FILE_NAME
    );

    this.minCoverage = this.validateNullableValueWithDefault<number>(
      data,
      "minCoverage",
      ProjectConfiguration.MINIMUM_COVERAGE_DEFAULT_VALUE,
      [this.getMinCoverageRangeValidation]
    );

    this.refBranch = this.validateNullableValueWithDefault<string>(
      data,
      "refBranch",
      "main"
    );

    this.runTestCoverage = this.validateNullableValueWithoutDefaultValue<
      string | undefined
    >(data, "runTestCoverage", "string");

    this.usePrePushValidation = this.validateNullableValueWithDefault<boolean>(
      data,
      "usePrePushValidation",
      false
    );
  }

  private getMinCoverageRangeValidation(value: number): ValidationResult {
    if (value < 0 || value > 1) {
      return {
        isValid: false,
        message: `Invalid value for minCoverage in ${ProjectConfiguration.DEFAULT_FILE_NAME}. It must be between 0 and 1.`,
      };
    }
    return { isValid: true, message: "" };
  }

  private validateNullableValueWithoutDefaultValue<
    V extends ProjectConfiguration[keyof ProjectConfiguration]
  >(
    data: ProjectConfiguration,
    fieldName: keyof ProjectConfiguration,
    defaultType:
      | "string"
      | "number"
      | "bigint"
      | "boolean"
      | "symbol"
      | "undefined"
      | "object"
      | "function"
  ): V | undefined {
    const value: any = data[fieldName];

    if (typeof value === defaultType) {
      return value;
    }

    if (value !== undefined && value !== null) {
      window.showErrorMessage(
        `Invalid value for ${String(fieldName)} in ${
          ProjectConfiguration.DEFAULT_FILE_NAME
        }. It must be a ${defaultType} or null.`
      );
    }

    return;
  }

  private validateNullableValueWithDefault<
    V extends ProjectConfiguration[keyof ProjectConfiguration]
  >(
    data: ProjectConfiguration,
    fieldName: keyof ProjectConfiguration,
    defaultValue: V,
    extraValidations?: Array<(value: V) => ValidationResult>
  ): V {
    const value: any = data[fieldName];

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
        `Invalid value for ${String(fieldName)} in ${
          ProjectConfiguration.DEFAULT_FILE_NAME
        }. It must be a ${defaultType} or null.`
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

  public static getFileData(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!workspace.workspaceFolders) {
        return resolve(null);
      }

      const rootPath = workspace.workspaceFolders[0].uri;
      const filePath = Uri.joinPath(rootPath, this.DEFAULT_FILE_NAME).fsPath;
      readFile(filePath, (err, data) => {
        if (err) {
          return resolve(null);
        }
        return resolve(data.toString());
      });
    });
  }
}
