import { LcovFile } from "lcov-parse";
import { appInjector } from "../../src/inversify.config";
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

beforeEach(() => {
  if (!appInjector) {
    return;
  }

  if (appInjector.isBound("ExtensionContext")) {
    appInjector
      .rebind("ExtensionContext")
      .toConstantValue(vscode.mocks.extensionContext as any);
  } else {
    appInjector
      .bind<ExtensionContext>("ExtensionContext")
      .toConstantValue(vscode.mocks.extensionContext as any);
  }

  appInjector.rebind(CoverageService).toConstantValue({
    getCoverageData: jest.fn(() => new Observable()),
    calculateCoverage: jest.fn(),
  } as any);

  appInjector.rebind(ExtensionConfigurationService).toConstantValue({
    getConfigurationData: jest.fn(() => new Observable()),
    toggleLineStatusVisibility: jest.fn(),
    toggleCoveragePercentageMode: jest.fn(),
    toggleCoverageBaseReferenceMode: jest.fn(),
    changeRefBranch: jest.fn(),
  } as any);

  appInjector.rebind(FileCoverageService).toConstantValue({
    getFileCoverage: jest.fn(() => new Observable()),
    addFileCoverageWatcher: jest.fn(),
  } as any);

  appInjector.rebind(ProjectConfigurationService).toConstantValue({
    requireConfigFileGeneration: jest.fn(async () => ({
      created: true,
    })),
    emitNewConfigurationFileCreated: jest.fn(),
    getProjectConfigurationData: jest.fn(() => new Observable()),
    fileChanged: jest.fn(),
  } as any);

  const mockedLcovFileFinder: LcovFile[] = [
    {
      file: "file1",
      branches: {
        hit: 0,
        found: 0,
        details: [],
      },
      functions: {
        hit: 0,
        found: 0,
        details: [],
      },
      lines: {
        hit: 0,
        found: 0,
        details: [],
      },
      title: "title1",
    },
  ];
  appInjector.rebind(LcovFileFinder).toConstantValue({
    findLcovFilesForEditor: jest.fn(() => mockedLcovFileFinder),
  } as any);

  appInjector.rebind(VisualStudioCode).toConstantValue({
    redirectEditorTo: jest.fn(),
    requestFileGeneration: jest.fn(),
    changeEditorDecoration: jest.fn(),
    changeToCoveringTab: jest.fn(),
    runScriptOnTerminal: jest.fn(),
    cancelEditorFocusChangeObservation: jest.fn(),
    observeEditorFocusChange: jest.fn(),
    getActiveEditorChange: jest.fn(),
    criaNaRaizDoProjetoUmArquivoDeConfiguração: jest.fn(),
    alterarOArquivoDeConfiguraçãoActivateDev: jest.fn(),
    getFileWatcher: jest.fn(),
  } as any);

  appInjector
    .rebind(DefaultConfiguration)
    .to(DefaultConfiguration)
    .inSingletonScope();

  appInjector.rebind(GitService).toConstantValue({
    getCurrentBranchDiff: jest.fn(),
    getIsCurrentFilesBranchDiff: jest.fn(),
    getFilesBranchDiff: jest.fn(),
    getIsGitWorkspace: jest.fn(),
    getIsBranch: jest.fn(),
    updateGitHookParams: jest.fn(),
    enablePreCommitHook: jest.fn(),
    disablePreCommitHook: jest.fn(),
  } as any);

  appInjector.rebind(UncoveredLinesService).toConstantValue({
    selectUncoveredLine: jest.fn(),
    getUncoveredLinesData: jest.fn(
      () => new Observable((resolver) => resolver.next())
    ),
    setCurrentUncoveredLines: jest.fn(),
  } as any);

  const mockedLogger: Partial<Logger> = {
    dispose: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  };
  appInjector.rebind(LoggerManager).toConstantValue({
    getServiceOutput: jest.fn(() => mockedLogger),
  } as any);

  jest.clearAllMocks();
});

export default appInjector;
