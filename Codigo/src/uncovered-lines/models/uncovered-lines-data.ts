import { Uri, workspace } from "vscode";
import { ConfigurationData } from "../../extension-configuration/models/configuration-data";
import { CoverageLines } from "../../file-coverage/models/coverage-lines";
import { FileCoverage } from "../../file-coverage/models/file-coverage";
import { Folder } from "./folder";

export type MappedFilesTestType = { uri: Uri; uncoveredLines: CoverageLines[] };

export class UncoveredLinesData {
  constructor(public readonly root: Folder) {}

  public static async updateUncoveredLinesData(
    fileCoverage: FileCoverage,
    extensionConfiguration: ConfigurationData
  ): Promise<UncoveredLinesData | null> {
    const uncoveredLines = await fileCoverage.getAllCoverageLines(
      extensionConfiguration.isBasedOnBranchChange
    );

    const workspaceFolders = workspace.workspaceFolders;
    if (workspaceFolders) {
      const root = workspaceFolders[0];
      const rootFolder = await Folder.createRootFolder(
        root.uri,
        uncoveredLines
      );
      return new UncoveredLinesData(rootFolder);
    }

    const rootUri = Uri.file(__dirname);
    const rootFolder = await Folder.createRootFolder(rootUri, uncoveredLines);
    return new UncoveredLinesData(rootFolder);
  }
}
