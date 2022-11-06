import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import * as inversify from "../../../mocks/inversify";

import { ProjectConfigurationService } from "../../../../src/project-configuration/core/project-configuration-service";
import { fileSystemHelper } from "../../../../src/utils/functions/file-system-helper";
import { FileCoverage } from "../../../../src/file-coverage/models/file-coverage";
import { ProjectConfiguration } from "../../../../src/project-configuration/models/project-configuration";

describe("ProjectConfigurationService", () => {
  let projectConfigurationService: ProjectConfigurationService;

  beforeEach(() => {
    vscode.workspace.workspaceFolders = [
      {
        uri: vscode.Uri.file("tests/mocks/workspace-with-covering-config"),
        index: 0,
      },
    ];

    projectConfigurationService = new ProjectConfigurationService();

    expect(inversify.mocks.VisualStudioCode.getFileWatcher).toBeCalledTimes(1);
    expect(
      inversify.mocks.VisualStudioCode.getFileWatcher
    ).toHaveBeenNthCalledWith(
      1,
      "project-configuration-file",
      ProjectConfiguration.DEFAULT_FILE_NAME
    );
  });

  it("should be defined", () => {
    expect(projectConfigurationService).toBeDefined();
  });

  it("should requireConfigFileGeneration when file not exist", async () => {
    vscode.workspace.workspaceFolders = [
      {
        uri: vscode.Uri.file("tests/mocks/workspace"),
        index: 0,
      },
    ];

    const writeStringFileSpy = jest
      .spyOn(fileSystemHelper, "writeStringFile")
      .mockResolvedValue();

    const result =
      await projectConfigurationService.requireConfigFileGeneration();

    expect(result).toEqual({ created: true });
    expect(writeStringFileSpy).toHaveBeenNthCalledWith(
      1,
      "tests/mocks/workspace/.coveringconfig",
      JSON.stringify(
        {
          lcovFileName: FileCoverage.DEFAULT_LCOV_FILE_NAME,
          minCoverage: 0.8,
          refBranch: "main",
          usePrePushValidation: false,
        },
        null,
        2
      )
    );
  });

  it("should requireConfigFileGeneration when file already exist", async () => {
    const writeStringFileSpy = jest.spyOn(fileSystemHelper, "writeStringFile");

    const result =
      await projectConfigurationService.requireConfigFileGeneration();

    expect(result).toEqual({
      created: false,
      error: "Config file already exists",
    });
    expect(writeStringFileSpy).not.toHaveBeenCalled();
  });

  it("should requireConfigFileGeneration when workspace is not set", async () => {
    const writeStringFileSpy = jest.spyOn(fileSystemHelper, "writeStringFile");
    vscode.workspace.workspaceFolders = undefined;

    const result =
      await projectConfigurationService.requireConfigFileGeneration();

    expect(result).toEqual({
      created: false,
      error: "No workspace folder found",
    });
    expect(writeStringFileSpy).not.toHaveBeenCalled();
  });

  it("should getProjectConfigurationData and get configuration data from file change", (done) => {
    let updateCounter = 0;

    projectConfigurationService
      .getProjectConfigurationData()
      .subscribe((configuration) => {
        updateCounter++;

        expect(configuration).toEqual({
          lcovFileName: "path/to/lcov.info",
          minCoverage: 0.9,
          refBranch: "master",
          usePrePushValidation: true,
        });

        if (updateCounter === 3) {
          done();
        }
      });

    projectConfigurationService.fileChanged();

    inversify.mocks.triggers.VisualStudioCode.getFileWatcher.next(undefined);
  });

  it("should getProjectConfigurationData when project file does not exists", (done) => {
    vscode.workspace.workspaceFolders = [
      {
        uri: vscode.Uri.file("tests/mocks/workspace"),
        index: 0,
      },
    ];

    let updateCounter = 0;

    projectConfigurationService
      .getProjectConfigurationData()
      .subscribe((configuration) => {
        updateCounter++;

        if (updateCounter === 3) {
          expect(configuration).toEqual({
            lcovFileName: "path/to/lcov.info",
            minCoverage: 0.9,
            refBranch: "master",
            usePrePushValidation: true,
          });

          done();
        } else {
          expect(configuration).toEqual({
            lcovFileName: "lcov.info",
            minCoverage: 0.8,
            refBranch: "main",
            usePrePushValidation: false,
          });
        }
      });

    projectConfigurationService.fileChanged();

    vscode.workspace.workspaceFolders = [
      {
        uri: vscode.Uri.file("tests/mocks/workspace-with-covering-config"),
        index: 0,
      },
    ];

    inversify.mocks.triggers.VisualStudioCode.getFileWatcher.next(undefined);
  });

  it("should getProjectConfigurationData when project file is not a json", (done) => {
    const getFileDataSpy = jest
      .spyOn(ProjectConfiguration, "getFileData")
      .mockResolvedValue("12345 {}");

    projectConfigurationService
      .getProjectConfigurationData()
      .subscribe((configuration) => {
        expect(getFileDataSpy).toBeCalledTimes(1);
        expect(vscode.window.showErrorMessage).toHaveBeenNthCalledWith(
          1,
          "Unexpected token { in JSON at position 6"
        );

        expect(configuration).toEqual({
          lcovFileName: "lcov.info",
          minCoverage: 0.8,
          refBranch: "main",
          usePrePushValidation: false,
        });

        done();
      });
  });

  it("should getProjectConfigurationData when project file have wrong minCoverage", (done) => {
    const getFileDataSpy = jest
      .spyOn(ProjectConfiguration, "getFileData")
      .mockResolvedValue(
        `{
          "lcovFileName": "path/to/lcov.info",
          "minCoverage": 90,
          "refBranch": "master",
          "usePrePushValidation": true
        }
        `
      );

    projectConfigurationService
      .getProjectConfigurationData()
      .subscribe((configuration) => {
        expect(getFileDataSpy).toBeCalledTimes(1);
        expect(vscode.window.showErrorMessage).toHaveBeenNthCalledWith(
          1,
          "Invalid value for minCoverage in .coveringconfig. It must be between 0 and 1."
        );

        expect(configuration).toEqual({
          lcovFileName: "path/to/lcov.info",
          minCoverage: 0.8,
          refBranch: "master",
          usePrePushValidation: true,
        });

        done();
      });
  });

  it("should getProjectConfigurationData when project file have wrong usePrePushValidation", (done) => {
    const getFileDataSpy = jest
      .spyOn(ProjectConfiguration, "getFileData")
      .mockResolvedValue(
        `{
          "lcovFileName": "path/to/lcov.info",
          "minCoverage": 0.9,
          "refBranch": "master",
          "usePrePushValidation": "true"
        }
        `
      );

    projectConfigurationService
      .getProjectConfigurationData()
      .subscribe((configuration) => {
        expect(getFileDataSpy).toBeCalledTimes(1);
        expect(vscode.window.showErrorMessage).toHaveBeenNthCalledWith(
          1,
          "Invalid value for usePrePushValidation in .coveringconfig. It must be a boolean or null."
        );

        expect(configuration).toEqual({
          lcovFileName: "path/to/lcov.info",
          minCoverage: 0.9,
          refBranch: "master",
          usePrePushValidation: false,
        });

        done();
      });
  });

  it("should getProjectConfigurationData run all fields validation", (done) => {
    const getFileDataSpy = jest
      .spyOn(ProjectConfiguration, "getFileData")
      .mockResolvedValue(
        `{
          "lcovFileName": 1,
          "minCoverage": "abc",
          "refBranch": 2,
          "usePrePushValidation": 3,
          "runTestCoverage": 4
        }
        `
      );

    projectConfigurationService
      .getProjectConfigurationData()
      .subscribe((configuration) => {
        expect(getFileDataSpy).toBeCalledTimes(1);
        expect(vscode.window.showErrorMessage).toHaveBeenNthCalledWith(
          1,
          "Invalid value for lcovFileName in .coveringconfig. It must be a string or null."
        );
        expect(vscode.window.showErrorMessage).toHaveBeenNthCalledWith(
          2,
          "Invalid value for minCoverage in .coveringconfig. It must be a number or null."
        );
        expect(vscode.window.showErrorMessage).toHaveBeenNthCalledWith(
          3,
          "Invalid value for refBranch in .coveringconfig. It must be a string or null."
        );
        expect(vscode.window.showErrorMessage).toHaveBeenNthCalledWith(
          4,
          "Invalid value for runTestCoverage in .coveringconfig. It must be a string or null."
        );
        expect(vscode.window.showErrorMessage).toHaveBeenNthCalledWith(
          5,
          "Invalid value for usePrePushValidation in .coveringconfig. It must be a boolean or null."
        );

        expect(configuration).toEqual({
          lcovFileName: "lcov.info",
          minCoverage: 0.8,
          refBranch: "main",
          usePrePushValidation: false,
        });

        done();
      });
  });
});
