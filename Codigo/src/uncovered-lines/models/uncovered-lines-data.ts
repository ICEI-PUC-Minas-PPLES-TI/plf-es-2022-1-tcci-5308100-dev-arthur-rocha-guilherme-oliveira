import { Uri, workspace } from "vscode";
import { ConfigurationData } from "../../extension-configuration/models/configuration-data";
import { CoverageLines } from "../../file-coverage/models/coverage-lines";
import { FileCoverage } from "../../file-coverage/models/file-coverage";
import { appInjector } from "../../inversify.config";
import { LoggerManager } from "../../utils/logger/logger-manager";
import { Folder } from "./folder";

export type MappedFilesTestType = { uri: Uri; uncoveredLines: CoverageLines[] };

export class UncoveredLinesData {
  constructor(public readonly root: Folder) {}

  public static async updateUncoveredLinesData(
    fileCoverage: FileCoverage,
    extensionConfiguration: ConfigurationData
  ): Promise<UncoveredLinesData | null> {
    const logger = appInjector
      .get(LoggerManager)
      .getServiceOutput("UncoveredLinesData");

    const uncoveredLines = await fileCoverage.getAllCoverageLines(
      extensionConfiguration.isBasedOnBranchChange,
      extensionConfiguration.referenceBranch
    );

    const workspaceFolders = workspace.workspaceFolders;
    if (workspaceFolders) {
      const rootUri = workspaceFolders[0].uri;

      logger.info(`Using workspace folder as root: ${rootUri.fsPath}`);
      try {
        const rootFolder = await Folder.createRootFolder(
          rootUri,
          uncoveredLines
        );
        return new UncoveredLinesData(rootFolder);
      } catch (e) {
        logger.error(String(e));
        return null;
      }
    }

    const rootUri = Uri.file(__dirname);

    logger.info(`Using __dirname as root: ${rootUri.fsPath}`);

    try {
      const rootFolder = await Folder.createRootFolder(rootUri, uncoveredLines);
      return new UncoveredLinesData(rootFolder);
    } catch (e) {
      logger.error(String(e));
      return null;
    }
  }
}
