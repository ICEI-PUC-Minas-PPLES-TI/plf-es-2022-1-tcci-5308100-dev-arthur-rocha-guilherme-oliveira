import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import "../../../mocks/inversify";
import { ExtensionConfigurationService } from "../../../../src/extension-configuration/core/extension-configuration-service";

describe("extensionConfigurationService", () => {
  let extensionConfigurationService: ExtensionConfigurationService;

  beforeEach(() => {
    extensionConfigurationService = new ExtensionConfigurationService();
  });

  it("should toggle Line status visibility", (done) => {
    let counter = 0;

    extensionConfigurationService.getConfigurationData().subscribe((data) => {
      counter++;

      expect(data.isBasedOnBranchChange).toBe(false);
      expect(data.referenceBranch).toBe("");
      expect(data.isJustForFileInFocus).toBe(false);
      expect(data.runTestCoverage).toBe("");

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
});
