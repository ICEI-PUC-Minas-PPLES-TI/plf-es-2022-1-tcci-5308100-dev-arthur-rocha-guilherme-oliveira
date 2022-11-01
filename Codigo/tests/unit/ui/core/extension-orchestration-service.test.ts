import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import { ExtensionOrchestrationService } from "../../../../src/ui/core/extension-orchestration-service";
import * as inversify from "../../../mocks/inversify";
import { ConfigurationView } from "../../../../src/extension-configuration/views/configuration-view";
import { CoverageView } from "../../../../src/coverage/views/coverage-view";
import { UncoveredLinesTree } from "../../../../src/uncovered-lines/views/uncovered-lines-tree";
import { ProjectConfiguration } from "../../../../src/project-configuration/models/project-configuration";
import { Writeable } from "../../../utils/types";

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

  it("should ", () => {
    const mocked: Writeable<ProjectConfiguration> = {
      lcovFileName: "lcov.info",
      minCoverage: 0.9,
      usePrePushValidation: true,
      refBranch: "master",
    };
    extensionOrchestrationService.emitNewProjectConfiguration(
      mocked as ProjectConfiguration
    );
  });
});
