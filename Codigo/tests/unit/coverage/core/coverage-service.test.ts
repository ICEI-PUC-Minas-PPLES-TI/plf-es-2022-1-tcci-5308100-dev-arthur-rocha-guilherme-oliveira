import "reflect-metadata";

import { CoverageService } from "../../../../src/coverage/core/coverage-service";
import { CoverageData } from "../../../../src/coverage/models/coverage-data";

describe("coverageService", () => {
  const coverageService = new CoverageService();

  it("should get coverage data", (done) => {
    const mockedCoverageData = new CoverageData(0, 0);
    const spyUpdateCoverageData = jest
      .spyOn(CoverageData, "updateCoverageData")
      .mockResolvedValue(mockedCoverageData);

    const fileCoverage = {};
    const projectConfiguration = {};
    const extensionConfiguration = {};

    const coverageData = coverageService.getCoverageData();

    coverageData.subscribe((data) => {
      expect(data).toBe(mockedCoverageData);

      done();
    });

    coverageService.calculateCoverage(
      fileCoverage as any,
      projectConfiguration as any,
      extensionConfiguration as any
    );

    expect(spyUpdateCoverageData).toHaveBeenCalledTimes(1);
  });
});
