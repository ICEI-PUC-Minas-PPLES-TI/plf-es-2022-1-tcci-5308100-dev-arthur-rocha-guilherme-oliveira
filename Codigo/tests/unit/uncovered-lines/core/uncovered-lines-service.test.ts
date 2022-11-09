import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import * as inversify from "../../../mocks/inversify";

import { UncoveredLinesService } from "../../../../src/uncovered-lines/core/uncovered-lines-service";
import { LineCoverageStatus } from "../../../../src/uncovered-lines/enums/line-coverage-status.enum";
import { RangeLine } from "../../../../src/utils/models/range-line";
import { UncoveredLinesData } from "../../../../src/uncovered-lines/models/uncovered-lines-data";

describe("UncoveredLinesService", () => {
  let uncoveredLinesService: UncoveredLinesService;

  beforeEach(() => {
    uncoveredLinesService = new UncoveredLinesService();
  });

  it("should getUncoveredLinesData", (done) => {
    uncoveredLinesService.getUncoveredLinesData().subscribe(({ root }) => {
      expect(root).toEqual(
        expect.objectContaining({
          files: expect.arrayContaining([
            expect.objectContaining({
              fileName: "mocked-file.ts",
              uri: vscode.Uri.file("tests/mocks/workspace/mocked-file.ts"),
              lines: expect.arrayContaining([
                expect.objectContaining({
                  coverageStatus: LineCoverageStatus.partiallyCovered,
                  rangeLine: new RangeLine(6),
                }),
                expect.objectContaining({
                  coverageStatus: LineCoverageStatus.uncovered,
                  rangeLine: new RangeLine(7),
                }),
                expect.objectContaining({
                  coverageStatus: LineCoverageStatus.partiallyCovered,
                  rangeLine: new RangeLine(10),
                }),
                expect.objectContaining({
                  coverageStatus: LineCoverageStatus.uncovered,
                  rangeLine: new RangeLine(11),
                }),
              ]),
            }),
          ]),
          folderName: "workspace",
          folders: [],
          hasSomethingToCover: true,
          uri: vscode.Uri.file("tests/mocks/workspace"),
        })
      );

      done();
    });

    const fileCoverage = inversify.mocks.stubs.getFileCoverage();
    const configurationData = inversify.mocks.stubs.getConfigurationData();

    uncoveredLinesService.setCurrentUncoveredLines(
      fileCoverage,
      configurationData
    );
  });

  it("should getUncoveredLinesData with some error in params", async () => {
    jest
      .spyOn(UncoveredLinesData, "updateUncoveredLinesData")
      .mockResolvedValueOnce(null);

    const fileCoverage = "fakeFileCoverage" as any;
    const configurationData = "fakeConfigurationData" as any;

    await uncoveredLinesService.setCurrentUncoveredLines(
      fileCoverage,
      configurationData
    );

    expect(inversify.mocks.Logger.error).toBeCalledWith(
      `Something went wrong while generating new uncovered lines data.\n` +
        `{\n` +
        `  "extensionConfiguration": "fakeConfigurationData",\n` +
        `  "fileCoverage": "fakeFileCoverage"\n` +
        `}`
    );
  });

  it("should getUncoveredLinesData twice and get the same observable", () => {
    const createdObservable = uncoveredLinesService.getUncoveredLinesData();
    const returnedTheSameInstanceOfObservable =
      uncoveredLinesService.getUncoveredLinesData();

    expect(createdObservable).toStrictEqual(
      returnedTheSameInstanceOfObservable
    );
  });

  it("should selectUncoveredLine", () => {
    uncoveredLinesService.selectUncoveredLine({
      coverageStatus: LineCoverageStatus.uncovered,
      rangeLine: new RangeLine(123),
      parentFile: {
        fileName: "file.ts",
        lines: [],
        uri: vscode.Uri.file("file.ts"),
      },
    });

    expect(vscode.window.showTextDocument).toBeCalledWith(
      vscode.Uri.file("file.ts"),
      {
        selection: new RangeLine(123),
      }
    );
  });
});
