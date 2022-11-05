import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import * as inversify from "../../../mocks/inversify";

import { CoverageService } from "../../../../src/coverage/core/coverage-service";
import { CoverageData } from "../../../../src/coverage/models/coverage-data";

describe("coverageService", () => {
  let coverageService: CoverageService;

  beforeEach(() => {
    coverageService = new CoverageService();
  });

  it("should get coverage data", (done) => {
    const mockedCoverageData = new CoverageData(0.5, 7 / 9);

    const fileCoverage = inversify.mocks.getFileCoverage();
    const projectConfiguration = inversify.mocks.getProjectConfiguration();
    const extensionConfiguration = inversify.mocks.getConfigurationData();

    coverageService.getCoverageData().subscribe((data) => {
      expect(data).toEqual(mockedCoverageData);

      done();
    });

    coverageService.calculateCoverage(
      fileCoverage,
      projectConfiguration,
      extensionConfiguration
    );
  });

  it("should get empty coverage data", (done) => {
    const mockedCoverageData = new CoverageData(0.5, undefined);

    const fileCoverage = inversify.mocks.getFileCoverage("empty");
    const projectConfiguration = inversify.mocks.getProjectConfiguration();
    const extensionConfiguration = inversify.mocks.getConfigurationData();

    coverageService.getCoverageData().subscribe((data) => {
      expect(data).toEqual(mockedCoverageData);

      done();
    });

    coverageService.calculateCoverage(
      fileCoverage,
      projectConfiguration,
      extensionConfiguration
    );
  });
});
