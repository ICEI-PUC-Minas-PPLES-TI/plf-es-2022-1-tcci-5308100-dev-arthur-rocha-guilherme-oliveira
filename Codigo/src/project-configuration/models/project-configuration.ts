import { readFile } from "fs";
import { window, workspace } from "vscode";

export class ProjectConfiguration {
  public static readonly fileName = ".coveringconfig";

  public readonly lcovFilePath?: string;
  public readonly minCoverage: number;
  public readonly refBranch?: string; // nullable just for a while
  public readonly runTestCoverage?: string;
  public readonly runTestCoverageWatchMode?: string;
  public readonly usePrePushValidation: boolean;

  constructor(private readonly data: any = {}) {
    this.lcovFilePath = data["lcovFilePath"];
    this.minCoverage = data["minCoverage"] ?? 0.8;
    this.refBranch = data["refBranch"];
    this.runTestCoverage = data["runTestCoverage"];
    this.runTestCoverageWatchMode = data["runTestCoverageWatchMode"];
    this.usePrePushValidation = data["usePrePushValidation"] ?? false;
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
      window.showErrorMessage(e.message);
      return new ProjectConfiguration();
    }
  }

  private static getFileData(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!workspace.workspaceFolders) {
        return resolve(null);
      }

      const rootPath = workspace.workspaceFolders[0].uri.fsPath;
      const filePath = `${rootPath}/${this.fileName}`;
      readFile(filePath, (err, data) => {
        if (err) {
          return resolve(null);
        }
        return resolve(data.toString());
      });
    });
  }
}
