import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import * as inversify from "../../../mocks/inversify";
import { ExtensionConfigurationService } from "../../../../src/extension-configuration/core/extension-configuration-service";

describe("extensionConfigurationService", () => {
  let extensionConfigurationService: ExtensionConfigurationService;

  beforeEach(() => {
    extensionConfigurationService = new ExtensionConfigurationService();
  });

  it("should toggle line status visibility", (done) => {
    let counter = 0;

    extensionConfigurationService.getConfigurationData().subscribe((data) => {
      counter++;

      expect(data.isBasedOnBranchChange).toBe(false);
      expect(data.referenceBranch).toBe("");
      expect(data.isJustForFileInFocus).toBe(false);

      if (counter === 1) {
        expect(data.isGutterActive).toBe(false);
      } else {
        expect(data.isGutterActive).toBe(true);
        done();
      }
    });

    extensionConfigurationService.toggleLineStatusVisibility();
    extensionConfigurationService.toggleLineStatusVisibility();
  });

  it("should toggle base branch change", (done) => {
    let counter = 0;

    extensionConfigurationService.getConfigurationData().subscribe((data) => {
      counter++;

      expect(data.isGutterActive).toBe(true);
      expect(data.referenceBranch).toBe("");
      expect(data.isJustForFileInFocus).toBe(false);

      if (counter === 1) {
        expect(data.isBasedOnBranchChange).toBe(true);
      } else {
        expect(data.isBasedOnBranchChange).toBe(false);
        done();
      }
    });

    extensionConfigurationService.toggleCoverageBaseReferenceMode();
    extensionConfigurationService.toggleCoverageBaseReferenceMode();
  });

  it("should toggle just file in focus", (done) => {
    let counter = 0;

    extensionConfigurationService.getConfigurationData().subscribe((data) => {
      counter++;

      expect(data.isGutterActive).toBe(true);
      expect(data.referenceBranch).toBe("");
      expect(data.isBasedOnBranchChange).toBe(false);

      if (counter === 1) {
        expect(data.isJustForFileInFocus).toBe(true);
      } else {
        expect(data.isJustForFileInFocus).toBe(false);
        done();
      }
    });

    extensionConfigurationService.toggleCoveragePercentageMode();
    extensionConfigurationService.toggleCoveragePercentageMode();
  });

  it("should change ref branch", (done) => {
    const spyGetIsBranch = jest
      .spyOn(inversify.mocks.GitService, "getIsBranch")
      .mockResolvedValue(true);

    let counter = 0;

    extensionConfigurationService.getConfigurationData().subscribe((data) => {
      counter++;

      expect(data.isGutterActive).toBe(true);
      expect(data.isJustForFileInFocus).toBe(false);
      expect(data.isBasedOnBranchChange).toBe(false);

      if (counter === 1) {
        expect(data.referenceBranch).toBe("master");
        expect(spyGetIsBranch).toBeCalledWith("master");
      } else {
        expect(data.referenceBranch).toBe("develop");
        expect(spyGetIsBranch).toBeCalledWith("develop");
        done();
      }
    });

    extensionConfigurationService.changeRefBranch("master");
    extensionConfigurationService.changeRefBranch("develop");
  });

  it("should change ref branch undefined", (done) => {
    extensionConfigurationService.getConfigurationData().subscribe((data) => {
      expect(data.isGutterActive).toBe(true);
      expect(data.isJustForFileInFocus).toBe(false);
      expect(data.isBasedOnBranchChange).toBe(false);

      expect(data.referenceBranch).toBe("");
      done();
    });

    extensionConfigurationService.changeRefBranch(undefined);
  });
});
