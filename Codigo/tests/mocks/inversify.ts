import { appInjector } from "../../src/inversify.config";
import { LcovFile } from "lcov-parse";
import { CoverageService } from "../../src/coverage/core/coverage-service";
import { FileCoverageService } from "../../src/file-coverage/core/file-coverage-service";
import { LcovFileFinder } from "../../src/utils/functions/lcov-file-finder";
import { VisualStudioCode } from "../../src/visual-studio-code/visual-studio-code";
import { DefaultConfiguration } from "../../src/config";
import { ExtensionConfigurationService } from "../../src/extension-configuration/core/extension-configuration-service";
import { GitService } from "../../src/version-control/core/git-service";
import { ProjectConfigurationService } from "../../src/project-configuration/core/project-configuration-service";
import { UncoveredLinesService } from "../../src/uncovered-lines/core/uncovered-lines-service";
import { LoggerManager } from "../../src/utils/logger/logger-manager";
import { ExtensionContext } from "vscode";
import * as vscode from "./vscode";
import { Observable } from "rxjs";
import { Logger } from "../../src/utils/logger/logger";
import { ProjectConfiguration } from "../../src/project-configuration/models/project-configuration";
import { Writeable } from "../utils/types";
import { ConfigurationData } from "../../src/extension-configuration/models/configuration-data";
import { FileCoverage } from "../../src/file-coverage/models/file-coverage";
import { CoverageData } from "../../src/coverage/models/coverage-data";

const mockedLcovFile: LcovFile = {
  lines: {
    found: 33,
    hit: 26,
    details: [
      { line: 1, hit: 1 },
      { line: 2, hit: 6 },
      { line: 3, hit: 1 },
      { line: 6, hit: 5 },
      { line: 7, hit: 0 },
      { line: 8, hit: 0 },
      { line: 11, hit: 5 },
      { line: 12, hit: 0 },
      { line: 15, hit: 5 },
    ],
  },
  functions: {
    hit: 3,
    found: 3,
    details: [{ name: "test", line: 1, hit: 6 }],
  },
  branches: {
    hit: 19,
    found: 29,
    details: [
      { line: 2, block: 1, branch: 0, taken: 1 },
      { line: 2, block: 1, branch: 1, taken: 5 },
      { line: 6, block: 2, branch: 0, taken: 0 },
      { line: 6, block: 2, branch: 1, taken: 5 },
      { line: 11, block: 3, branch: 0, taken: 0 },
      { line: 11, block: 3, branch: 1, taken: 5 },
    ],
  },
  title: "",
  file: "mocked-file.ts",
};

const mockedLcovFiles: LcovFile[] = [mockedLcovFile];

const mockedLogger: Partial<Logger> = {
  dispose: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  success: jest.fn(),
};

const mockProjectConfiguration: Writeable<ProjectConfiguration> = {
  lcovFileName: "lcov.info",
  minCoverage: 0.8,
  usePrePushValidation: true,
  refBranch: "master",
  runTestCoverage: "npm t",
};
const mockConfigurationData: Writeable<ConfigurationData> = {
  isBasedOnBranchChange: false,
  isGutterActive: true,
  isJustForFileInFocus: false,
  referenceBranch: "master",
};
const mockCoverageData: Writeable<CoverageData> = {
  minCoveragePercentage: 0.8,
  coveragePercentage: 0,
  minCoverageReached: true,
};

export const mocks = {
  CoverageService: {
    getCoverageData: jest.fn(
      () => new Observable((resolver) => resolver.next(mockCoverageData))
    ),
    calculateCoverage: jest.fn(),
  },
  ExtensionConfigurationService: {
    getConfigurationData: jest.fn(
      () => new Observable((resolver) => resolver.next(mockConfigurationData))
    ),
    toggleLineStatusVisibility: jest.fn(),
    toggleCoveragePercentageMode: jest.fn(),
    toggleCoverageBaseReferenceMode: jest.fn(),
    changeRefBranch: jest.fn(),
  },
  FileCoverageService: {
    getFileCoverage: jest.fn(
      () =>
        new Observable((resolver) => {
          const mapMock = new Map<string, LcovFile>();
          mapMock.set("file1", mockedLcovFiles[0]);

          const mockFileCoverage = new FileCoverage(mapMock);
          resolver.next(mockFileCoverage);
        })
    ),
    addFileCoverageWatcher: jest.fn(),
  },
  ProjectConfigurationService: {
    requireConfigFileGeneration: jest
      .fn()
      .mockReturnValueOnce({
        created: true,
      })
      .mockReturnValueOnce({
        created: false,
        error: "error",
      }),
    emitNewConfigurationFileCreated: jest.fn(),
    getProjectConfigurationData: jest.fn(
      () =>
        new Observable((resolver) => resolver.next(mockProjectConfiguration))
    ),
    fileChanged: jest.fn(),
  },
  LcovFileFinder: {
    findLcovFilesForEditor: jest.fn(() => mockedLcovFiles),
  },
  VisualStudioCode: {
    redirectEditorTo: jest.fn(),
    requestFileGeneration: jest.fn(),
    changeEditorDecoration: jest.fn(),
    changeToCoveringTab: jest.fn(),
    runScriptOnTerminal: jest.fn(),
    cancelEditorFocusChangeObservation: jest.fn(),
    observeEditorFocusChange: jest.fn(),
    getActiveEditorChange: jest.fn(
      () => new Observable((resolver) => resolver.next())
    ),
    criaNaRaizDoProjetoUmArquivoDeConfiguração: jest.fn(),
    alterarOArquivoDeConfiguraçãoActivateDev: jest.fn(),
    getFileWatcher: jest.fn(),
  },
  GitService: {
    getCurrentBranchDiff: jest.fn(() => [
      "mocked-file.ts b/mocked-file.ts\nindex 8d0204a..272c6e2 100644\n--- a/mocked-file.ts\n+++ b/mocked-file.ts\n@@ -6,0 +7 @@ module.exports.test = function test(testNumber) {\n+        console.log()\n",
    ]),
    getIsCurrentFilesBranchDiff: jest.fn(() => true),
    getFilesBranchDiff: jest.fn(),
    getIsGitWorkspace: jest.fn(),
    getIsBranch: jest.fn(),
    updateGitHookParams: jest.fn(),
    enablePreCommitHook: jest.fn(),
    disablePreCommitHook: jest.fn(),
  },
  UncoveredLinesService: {
    selectUncoveredLine: jest.fn(),
    getUncoveredLinesData: jest.fn(
      () => new Observable((resolver) => resolver.next())
    ),
    setCurrentUncoveredLines: jest.fn(),
  },
  LoggerManager: {
    getServiceOutput: jest.fn(() => mockedLogger),
  },
  Logger: mockedLogger,
  LcovFile: mockedLcovFile,
  getLcovFileMap: () => {
    const mocked_lcov_files_map = new Map();
    mocked_lcov_files_map.set("mocked-file.ts", mockedLcovFile);
    return mocked_lcov_files_map;
  },
};

beforeEach(() => {
  if (!appInjector) {
    return;
  }

  jest.clearAllMocks();

  if (appInjector.isBound("ExtensionContext")) {
    appInjector
      .rebind("ExtensionContext")
      .toConstantValue(vscode.mocks.extensionContext as any);
  } else {
    appInjector
      .bind<ExtensionContext>("ExtensionContext")
      .toConstantValue(vscode.mocks.extensionContext as any);
  }

  appInjector
    .rebind(CoverageService)
    .toConstantValue(mocks.CoverageService as any);

  appInjector
    .rebind(ExtensionConfigurationService)
    .toConstantValue(mocks.ExtensionConfigurationService as any);

  appInjector
    .rebind(FileCoverageService)
    .toConstantValue(mocks.FileCoverageService as any);

  appInjector
    .rebind(ProjectConfigurationService)
    .toConstantValue(mocks.ProjectConfigurationService as any);

  appInjector
    .rebind(LcovFileFinder)
    .toConstantValue(mocks.LcovFileFinder as any);

  appInjector
    .rebind(VisualStudioCode)
    .toConstantValue(mocks.VisualStudioCode as any);

  appInjector
    .rebind(DefaultConfiguration)
    .to(DefaultConfiguration)
    .inSingletonScope();

  appInjector.rebind(GitService).toConstantValue(mocks.GitService as any);

  appInjector
    .rebind(UncoveredLinesService)
    .toConstantValue(mocks.UncoveredLinesService as any);

  appInjector.rebind(LoggerManager).toConstantValue(mocks.LoggerManager as any);
});

export { appInjector };
