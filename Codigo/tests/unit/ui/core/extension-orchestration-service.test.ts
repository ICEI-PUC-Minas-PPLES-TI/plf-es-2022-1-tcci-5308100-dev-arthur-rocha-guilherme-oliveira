import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import { ExtensionOrchestrationService } from "../../../../src/ui/core/extension-orchestration-service";
import * as inversify from "../../../mocks/inversify";
import { ConfigurationView } from "../../../../src/extension-configuration/views/configuration-view";
import { CoverageView } from "../../../../src/coverage/views/coverage-view";
import { UncoveredLinesTree } from "../../../../src/uncovered-lines/views/uncovered-lines-tree";
import { ProjectConfiguration } from "../../../../src/project-configuration/models/project-configuration";
import { Writeable } from "../../../utils/types";
import { FileCoverage } from "../../../../src/file-coverage/models/file-coverage";
import { LcovFile } from "lcov-parse";
import { ConfigurationData } from "../../../../src/extension-configuration/models/configuration-data";

describe("ExtensionOrchestrationService", () => {
  let extensionOrchestrationService: ExtensionOrchestrationService;

  beforeEach(() => {
    extensionOrchestrationService = new ExtensionOrchestrationService();
  });

  it("should initiate app", (done) => {
    expect(extensionOrchestrationService.initApp).toBeDefined();

    const spyConfigurationViewCreateView = jest.spyOn(
      ConfigurationView,
      "createView"
    );
    const spyCoverageViewCreateView = jest.spyOn(CoverageView, "createView");
    const spyUncoveredLinesTreeCreateView = jest.spyOn(
      UncoveredLinesTree,
      "createView"
    );
    extensionOrchestrationService.initApp().subscribe(() => {
      expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(3);

      expect(spyConfigurationViewCreateView).toHaveBeenCalledTimes(1);
      expect(spyCoverageViewCreateView).toHaveBeenCalledTimes(1);
      expect(spyUncoveredLinesTreeCreateView).toHaveBeenCalledTimes(1);

      expect(
        inversify.mocks.ProjectConfigurationService.getProjectConfigurationData
      ).toHaveBeenCalledTimes(1);
      expect(
        inversify.mocks.ExtensionConfigurationService.getConfigurationData
      ).toHaveBeenCalledTimes(1);
      expect(
        inversify.mocks.FileCoverageService.getFileCoverage
      ).toHaveBeenCalledTimes(1);
      expect(
        inversify.mocks.CoverageService.getCoverageData
      ).toHaveBeenCalledTimes(1);
      expect(
        inversify.mocks.VisualStudioCode.getActiveEditorChange
      ).toHaveBeenCalledTimes(1);

      done();
    });
  });

  it("should finish app", () => {
    expect(extensionOrchestrationService.finishApp).toBeDefined();

    extensionOrchestrationService.finishApp();

    expect(
      inversify.mocks.GitService.disablePreCommitHook
    ).toHaveBeenCalledTimes(1);
  });

  it("should generate project configuration file", async () => {
    await extensionOrchestrationService.generateProjectConfigurationFileCommand();

    expect(
      inversify.mocks.ProjectConfigurationService.requireConfigFileGeneration
    ).toHaveBeenCalledTimes(1);
    expect(inversify.mocks.Logger.warn).not.toHaveBeenCalled();
    expect(
      inversify.mocks.VisualStudioCode.redirectEditorTo
    ).toHaveBeenNthCalledWith(1, ProjectConfiguration.DEFAULT_FILE_NAME);
  });

  it("should emitNewProjectConfiguration with set actual values with usePrePushValidation = true", () => {
    const mockedFileCoverage = new FileCoverage(new Map<string, LcovFile>());
    extensionOrchestrationService.emitNewFileCoverage(mockedFileCoverage);

    const mockedCoverageData: Writeable<ConfigurationData> = {
      isBasedOnBranchChange: true,
      isGutterActive: true,
      isJustForFileInFocus: true,
      referenceBranch: "master",
    };
    extensionOrchestrationService.emitNewConfigurationData(
      mockedCoverageData as ConfigurationData
    );

    jest.clearAllMocks();

    const mockedProjectConfiguration: Writeable<ProjectConfiguration> = {
      lcovFileName: "lcov.info",
      minCoverage: 0.9,
      usePrePushValidation: true,
      refBranch: "master",
    };
    extensionOrchestrationService.emitNewProjectConfiguration(
      mockedProjectConfiguration as ProjectConfiguration
    );

    expect(
      inversify.mocks.FileCoverageService.addFileCoverageWatcher
    ).toHaveBeenNthCalledWith(1, mockedProjectConfiguration.lcovFileName);

    expect(
      inversify.mocks.CoverageService.calculateCoverage
    ).toHaveBeenNthCalledWith(
      1,
      mockedFileCoverage,
      mockedProjectConfiguration,
      mockedCoverageData
    );

    expect(
      inversify.mocks.ExtensionConfigurationService.changeRefBranch
    ).toHaveBeenNthCalledWith(1, mockedProjectConfiguration.refBranch);

    expect(
      inversify.mocks.GitService.enablePreCommitHook
    ).toHaveBeenCalledTimes(1);
  });

  it("should emitNewProjectConfiguration with set actual values with usePrePushValidation = false", () => {
    const mockedFileCoverage = new FileCoverage(new Map<string, LcovFile>());
    extensionOrchestrationService.emitNewFileCoverage(mockedFileCoverage);

    const mockedCoverageData: Writeable<ConfigurationData> = {
      isBasedOnBranchChange: true,
      isGutterActive: true,
      isJustForFileInFocus: true,
      referenceBranch: "master",
    };
    extensionOrchestrationService.emitNewConfigurationData(
      mockedCoverageData as ConfigurationData
    );

    jest.clearAllMocks();

    const mockedProjectConfiguration: Writeable<ProjectConfiguration> = {
      lcovFileName: "lcov.info",
      minCoverage: 0.9,
      usePrePushValidation: false,
      refBranch: "master",
    };
    extensionOrchestrationService.emitNewProjectConfiguration(
      mockedProjectConfiguration as ProjectConfiguration
    );

    expect(
      inversify.mocks.FileCoverageService.addFileCoverageWatcher
    ).toHaveBeenNthCalledWith(1, mockedProjectConfiguration.lcovFileName);

    expect(
      inversify.mocks.CoverageService.calculateCoverage
    ).toHaveBeenNthCalledWith(
      1,
      mockedFileCoverage,
      mockedProjectConfiguration,
      mockedCoverageData
    );

    expect(
      inversify.mocks.ExtensionConfigurationService.changeRefBranch
    ).toHaveBeenNthCalledWith(1, mockedProjectConfiguration.refBranch);

    expect(
      inversify.mocks.GitService.disablePreCommitHook
    ).toHaveBeenCalledTimes(1);
  });

  it("should emitNewConfigurationData with set actual values", () => {
    const mockedProjectConfiguration: Writeable<ProjectConfiguration> = {
      lcovFileName: "lcov.info",
      minCoverage: 0.9,
      usePrePushValidation: true,
      refBranch: "master",
    };
    extensionOrchestrationService.emitNewProjectConfiguration(
      mockedProjectConfiguration as ProjectConfiguration
    );

    const mockedFileCoverage = new FileCoverage(new Map<string, LcovFile>());
    extensionOrchestrationService.emitNewFileCoverage(mockedFileCoverage);

    jest.clearAllMocks();

    const mockedCoverageData: Writeable<ConfigurationData> = {
      isBasedOnBranchChange: true,
      isGutterActive: true,
      isJustForFileInFocus: true,
      referenceBranch: "master",
    };
    extensionOrchestrationService.emitNewConfigurationData(
      mockedCoverageData as ConfigurationData
    );

    expect(
      inversify.mocks.VisualStudioCode.changeEditorDecoration
    ).toHaveBeenNthCalledWith(1, mockedFileCoverage, mockedCoverageData);

    expect(
      inversify.mocks.UncoveredLinesService.setCurrentUncoveredLines
    ).toHaveBeenNthCalledWith(1, mockedFileCoverage, mockedCoverageData);

    expect(
      inversify.mocks.CoverageService.calculateCoverage
    ).toHaveBeenNthCalledWith(
      1,
      mockedFileCoverage,
      mockedProjectConfiguration,
      mockedCoverageData
    );
  });

  it("should emitNewFileCoverage with set actual values", () => {
    const mockedCoverageData: Writeable<ConfigurationData> = {
      isBasedOnBranchChange: true,
      isGutterActive: true,
      isJustForFileInFocus: true,
      referenceBranch: "master",
    };
    extensionOrchestrationService.emitNewConfigurationData(
      mockedCoverageData as ConfigurationData
    );

    const mockedProjectConfiguration: Writeable<ProjectConfiguration> = {
      lcovFileName: "lcov.info",
      minCoverage: 0.9,
      usePrePushValidation: true,
      refBranch: "master",
    };
    extensionOrchestrationService.emitNewProjectConfiguration(
      mockedProjectConfiguration as ProjectConfiguration
    );

    jest.clearAllMocks();

    const mockedFileCoverage = new FileCoverage(new Map<string, LcovFile>());
    extensionOrchestrationService.emitNewFileCoverage(mockedFileCoverage);

    expect(
      inversify.mocks.CoverageService.calculateCoverage
    ).toHaveBeenNthCalledWith(
      1,
      mockedFileCoverage,
      mockedProjectConfiguration,
      mockedCoverageData
    );

    expect(
      inversify.mocks.VisualStudioCode.changeEditorDecoration
    ).toHaveBeenNthCalledWith(1, mockedFileCoverage, mockedCoverageData);

    expect(
      inversify.mocks.UncoveredLinesService.setCurrentUncoveredLines
    ).toHaveBeenNthCalledWith(1, mockedFileCoverage, mockedCoverageData);
  });

  it("should runTest correctly", () => {
    const mockedProjectConfiguration: Writeable<ProjectConfiguration> = {
      lcovFileName: "lcov.info",
      minCoverage: 0.9,
      usePrePushValidation: true,
      refBranch: "master",
      runTestCoverage: "npm t",
    };
    extensionOrchestrationService.emitNewProjectConfiguration(
      mockedProjectConfiguration as ProjectConfiguration
    );

    jest.clearAllMocks();

    extensionOrchestrationService.runTest();

    expect(inversify.mocks.Logger.error).toHaveBeenCalledTimes(0);

    expect(
      inversify.mocks.VisualStudioCode.runScriptOnTerminal
    ).toHaveBeenNthCalledWith(1, mockedProjectConfiguration.runTestCoverage);
  });

  it("should runTest with undefined script", () => {
    const mockedProjectConfiguration: Writeable<ProjectConfiguration> = {
      lcovFileName: "lcov.info",
      minCoverage: 0.9,
      usePrePushValidation: true,
      refBranch: "master",
    };
    extensionOrchestrationService.emitNewProjectConfiguration(
      mockedProjectConfiguration as ProjectConfiguration
    );

    jest.clearAllMocks();

    extensionOrchestrationService.runTest();

    expect(inversify.mocks.Logger.error).toHaveBeenNthCalledWith(
      1,
      "Please configure the command to run the tests",
      true
    );

    expect(
      inversify.mocks.VisualStudioCode.runScriptOnTerminal
    ).toHaveBeenCalledTimes(0);
  });

  it("should generateProjectConfigurationFileCommand correctly", async () => {
    inversify.mocks.ProjectConfigurationService.requireConfigFileGeneration.mockResolvedValue(
      {
        created: true,
      }
    );

    await extensionOrchestrationService.generateProjectConfigurationFileCommand();

    expect(
      inversify.mocks.VisualStudioCode.redirectEditorTo
    ).toHaveBeenNthCalledWith(1, ProjectConfiguration.DEFAULT_FILE_NAME);
  });

  it("should generateProjectConfigurationFileCommand when already created", async () => {
    inversify.mocks.ProjectConfigurationService.requireConfigFileGeneration.mockResolvedValue(
      {
        created: false,
        error: "error",
      }
    );

    await extensionOrchestrationService.generateProjectConfigurationFileCommand();

    expect(
      inversify.mocks.VisualStudioCode.redirectEditorTo
    ).toHaveBeenNthCalledWith(1, ProjectConfiguration.DEFAULT_FILE_NAME);
  });

  it("should fileFocusChange event emitted", () => {
    const mockedCoverageData: Writeable<ConfigurationData> = {
      isBasedOnBranchChange: true,
      isGutterActive: true,
      isJustForFileInFocus: true,
      referenceBranch: "master",
    };
    extensionOrchestrationService.emitNewConfigurationData(
      mockedCoverageData as ConfigurationData
    );

    const mockedProjectConfiguration: Writeable<ProjectConfiguration> = {
      lcovFileName: "lcov.info",
      minCoverage: 0.9,
      usePrePushValidation: true,
      refBranch: "master",
    };
    extensionOrchestrationService.emitNewProjectConfiguration(
      mockedProjectConfiguration as ProjectConfiguration
    );

    const mockedFileCoverage = new FileCoverage(new Map<string, LcovFile>());
    extensionOrchestrationService.emitNewFileCoverage(mockedFileCoverage);

    jest.clearAllMocks();

    extensionOrchestrationService.fileFocusChange();

    expect(
      inversify.mocks.CoverageService.calculateCoverage
    ).toHaveBeenNthCalledWith(
      1,
      mockedFileCoverage,
      mockedProjectConfiguration,
      mockedCoverageData
    );

    expect(
      inversify.mocks.UncoveredLinesService.setCurrentUncoveredLines
    ).toHaveBeenNthCalledWith(1, mockedFileCoverage, mockedCoverageData);
  });
});
