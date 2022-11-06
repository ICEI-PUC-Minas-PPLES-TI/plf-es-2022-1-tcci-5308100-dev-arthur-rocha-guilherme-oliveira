import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import * as inversify from "../../../mocks/inversify";

import { FileCoverageService } from "../../../../src/file-coverage/core/file-coverage-service";
import { FileCoverage } from "../../../../src/file-coverage/models/file-coverage";

describe("FileCoverageService", () => {
  let fileCoverageService: FileCoverageService;

  beforeEach(() => {
    inversify;
    fileCoverageService = new FileCoverageService();
  });

  it("should getFileCoverage", (done) => {
    const fakeLcovFileName = "shulambs.info";

    jest
      .spyOn(FileCoverage, "createNewCoverageFile")
      .mockResolvedValueOnce(inversify.mocks.stubs.getFileCoverage())
      .mockResolvedValueOnce(inversify.mocks.stubs.getFileCoverage())
      .mockResolvedValueOnce(inversify.mocks.stubs.getFileCoverage("empty"));

    fileCoverageService.addFileCoverageWatcher(
      FileCoverage.DEFAULT_LCOV_FILE_NAME
    );

    let updateCount = 0;
    fileCoverageService.getFileCoverage().subscribe((fileCoverage) => {
      updateCount++;

      if (updateCount === 3) {
        expect(fileCoverage.getLcovFiles()).toEqual([]);

        expect(
          inversify.mocks.VisualStudioCode.getFileWatcher
        ).toHaveBeenNthCalledWith(
          1,
          "coverage_file",
          FileCoverage.DEFAULT_LCOV_FILE_NAME
        );
        expect(
          inversify.mocks.VisualStudioCode.getFileWatcher
        ).toHaveBeenNthCalledWith(2, "coverage_file", fakeLcovFileName);

        done();
      } else {
        expect(fileCoverage.getLcovFiles()).toEqual([inversify.mocks.LcovFile]);
      }
    });

    inversify.mocks.triggers.VisualStudioCode.getFileWatcher.next(undefined);

    fileCoverageService.addFileCoverageWatcher(fakeLcovFileName);
  });
});
