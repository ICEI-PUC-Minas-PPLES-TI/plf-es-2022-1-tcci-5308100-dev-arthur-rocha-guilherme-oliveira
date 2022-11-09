import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import * as inversify from "../../../mocks/inversify";

import { FileCoverage } from "../../../../src/file-coverage/models/file-coverage";

describe("FileCoverage", () => {
  let fileCoverage: FileCoverage;

  beforeEach(() => {
    fileCoverage = new FileCoverage(inversify.mocks.stubs.getLcovFileMap());
  });

  it("should getCoverageLinesForEditor default", async () => {
    const coverageLines = await fileCoverage.getCoverageLinesForEditor(
      vscode.mocks.textEditor as any,
      false,
      "master"
    );

    expect(coverageLines).toEqual({
      full: [
        {
          startLine: 0,
          startCharacter: 0,
          endLine: 0,
          endCharacter: 0,
          start: { line: 0, character: 0 },
          lineNumber: 1,
        },
        {
          startLine: 1,
          startCharacter: 0,
          endLine: 1,
          endCharacter: 0,
          start: { line: 1, character: 0 },
          lineNumber: 2,
        },
        {
          startLine: 2,
          startCharacter: 0,
          endLine: 2,
          endCharacter: 0,
          start: { line: 2, character: 0 },
          lineNumber: 3,
        },
        {
          startLine: 13,
          startCharacter: 0,
          endLine: 13,
          endCharacter: 0,
          start: { line: 13, character: 0 },
          lineNumber: 14,
        },
        {
          startLine: 15,
          startCharacter: 0,
          endLine: 15,
          endCharacter: 0,
          start: { line: 15, character: 0 },
          lineNumber: 16,
        },
      ],
      partial: [
        {
          startLine: 5,
          startCharacter: 0,
          endLine: 5,
          endCharacter: 0,
          start: { line: 5, character: 0 },
          lineNumber: 6,
        },
        {
          startLine: 9,
          startCharacter: 0,
          endLine: 9,
          endCharacter: 0,
          start: { line: 9, character: 0 },
          lineNumber: 10,
        },
      ],
      none: [
        {
          startLine: 6,
          startCharacter: 0,
          endLine: 6,
          endCharacter: 0,
          start: { line: 6, character: 0 },
          lineNumber: 7,
        },
        {
          startLine: 10,
          startCharacter: 0,
          endLine: 10,
          endCharacter: 0,
          start: { line: 10, character: 0 },
          lineNumber: 11,
        },
      ],
    });

    expect(
      inversify.mocks.GitService.getIsCurrentFilesBranchDiff
    ).not.toHaveBeenCalledTimes(1);
    expect(
      inversify.mocks.GitService.getCurrentBranchDiff
    ).not.toHaveBeenCalledTimes(1);
  });

  it("should getCoverageLinesForEditor using git diff", async () => {
    const coverageLines = await fileCoverage.getCoverageLinesForEditor(
      vscode.mocks.textEditor as any,
      true,
      "master"
    );

    expect(coverageLines).toEqual({
      full: [],
      partial: [],
      none: [
        {
          startLine: 6,
          startCharacter: 0,
          endLine: 6,
          endCharacter: 0,
          start: {
            line: 6,
            character: 0,
          },
          lineNumber: 7,
        },
      ],
    });

    expect(
      inversify.mocks.GitService.getIsCurrentFilesBranchDiff
    ).toHaveBeenCalledTimes(1);
    expect(
      inversify.mocks.GitService.getCurrentBranchDiff
    ).toHaveBeenCalledTimes(1);
  });

  it("should getAllCoverageLines in default behavior", async () => {
    const extensionConfiguration = inversify.mocks.stubs.getConfigurationData();

    const coverageLines = await fileCoverage.getAllCoverageLines(
      extensionConfiguration
    );

    expect(coverageLines).toEqual([
      {
        fileName: {
          scheme: "file",
          authority: "",
          path: "mocked-file.ts",
          query: "",
          fragment: "",
        },
        coverageLines: {
          full: [
            {
              startLine: 0,
              startCharacter: 0,
              endLine: 0,
              endCharacter: 0,
              start: { line: 0, character: 0 },
              lineNumber: 1,
            },
            {
              startLine: 1,
              startCharacter: 0,
              endLine: 1,
              endCharacter: 0,
              start: { line: 1, character: 0 },
              lineNumber: 2,
            },
            {
              startLine: 2,
              startCharacter: 0,
              endLine: 2,
              endCharacter: 0,
              start: { line: 2, character: 0 },
              lineNumber: 3,
            },
            {
              startLine: 13,
              startCharacter: 0,
              endLine: 13,
              endCharacter: 0,
              start: { line: 13, character: 0 },
              lineNumber: 14,
            },
            {
              startLine: 15,
              startCharacter: 0,
              endLine: 15,
              endCharacter: 0,
              start: { line: 15, character: 0 },
              lineNumber: 16,
            },
          ],
          partial: [
            {
              startLine: 5,
              startCharacter: 0,
              endLine: 5,
              endCharacter: 0,
              start: { line: 5, character: 0 },
              lineNumber: 6,
            },
            {
              startLine: 9,
              startCharacter: 0,
              endLine: 9,
              endCharacter: 0,
              start: { line: 9, character: 0 },
              lineNumber: 10,
            },
          ],
          none: [
            {
              startLine: 6,
              startCharacter: 0,
              endLine: 6,
              endCharacter: 0,
              start: { line: 6, character: 0 },
              lineNumber: 7,
            },
            {
              startLine: 10,
              startCharacter: 0,
              endLine: 10,
              endCharacter: 0,
              start: { line: 10, character: 0 },
              lineNumber: 11,
            },
          ],
        },
      },
    ]);
  });

  it("should getAllCoverageLines just for file in focus", async () => {
    const extensionConfiguration = inversify.mocks.stubs.getConfigurationData();
    extensionConfiguration.isJustForFileInFocus = true;

    const coverageLines = await fileCoverage.getAllCoverageLines(
      extensionConfiguration
    );

    expect(coverageLines).toEqual([
      {
        fileName: {
          scheme: "file",
          authority: "",
          path: "mocked-file.ts",
          query: "",
          fragment: "",
        },
        coverageLines: {
          full: [
            {
              startLine: 0,
              startCharacter: 0,
              endLine: 0,
              endCharacter: 0,
              start: { line: 0, character: 0 },
              lineNumber: 1,
            },
            {
              startLine: 1,
              startCharacter: 0,
              endLine: 1,
              endCharacter: 0,
              start: { line: 1, character: 0 },
              lineNumber: 2,
            },
            {
              startLine: 2,
              startCharacter: 0,
              endLine: 2,
              endCharacter: 0,
              start: { line: 2, character: 0 },
              lineNumber: 3,
            },
            {
              startLine: 13,
              startCharacter: 0,
              endLine: 13,
              endCharacter: 0,
              start: { line: 13, character: 0 },
              lineNumber: 14,
            },
            {
              startLine: 15,
              startCharacter: 0,
              endLine: 15,
              endCharacter: 0,
              start: { line: 15, character: 0 },
              lineNumber: 16,
            },
          ],
          partial: [
            {
              startLine: 5,
              startCharacter: 0,
              endLine: 5,
              endCharacter: 0,
              start: { line: 5, character: 0 },
              lineNumber: 6,
            },
            {
              startLine: 9,
              startCharacter: 0,
              endLine: 9,
              endCharacter: 0,
              start: { line: 9, character: 0 },
              lineNumber: 10,
            },
          ],
          none: [
            {
              startLine: 6,
              startCharacter: 0,
              endLine: 6,
              endCharacter: 0,
              start: { line: 6, character: 0 },
              lineNumber: 7,
            },
            {
              startLine: 10,
              startCharacter: 0,
              endLine: 10,
              endCharacter: 0,
              start: { line: 10, character: 0 },
              lineNumber: 11,
            },
          ],
        },
      },
    ]);
  });

  it("should getAllCoverageLines just for file in focus with nothing to cover", async () => {
    vscode.window.activeTextEditor = {
      document: {
        uri: vscode.Uri.file("active-file.txt"),
      },
      viewColumn: vscode.ViewColumn.One,
    };

    const extensionConfiguration = inversify.mocks.stubs.getConfigurationData();
    extensionConfiguration.isJustForFileInFocus = true;

    const coverageLines = await fileCoverage.getAllCoverageLines(
      extensionConfiguration
    );

    expect(coverageLines).toEqual([]);
  });

  it("should getAllCoverageLines just for file without active editor", async () => {
    vscode.window.activeTextEditor = undefined;
    const extensionConfiguration = inversify.mocks.stubs.getConfigurationData();
    extensionConfiguration.isJustForFileInFocus = true;

    const coverageLines = await fileCoverage.getAllCoverageLines(
      extensionConfiguration
    );

    expect(coverageLines).toEqual([]);
  });

  it("should createNewCoverageFile for default file", async () => {
    const createdFileCoverage = await FileCoverage.createNewCoverageFile();

    const foundedLcovFiles = createdFileCoverage.getLcovFiles();

    expect(foundedLcovFiles).toEqual([inversify.mocks.LcovFile]);
  });

  it("should createNewCoverageFile for an inexistent file", async () => {
    const createdFileCoverage = await FileCoverage.createNewCoverageFile(
      "lcov-inexistent-file.info"
    );

    expect(createdFileCoverage).toEqual(
      inversify.mocks.stubs.getFileCoverage("empty")
    );
  });

  it("should createNewCoverageFile for an file with lcov syntax error", async () => {
    const createdFileCoverage = await FileCoverage.createNewCoverageFile(
      "lcov-with-error.info"
    );

    expect(createdFileCoverage).toEqual(
      inversify.mocks.stubs.getFileCoverage("empty")
    );
  });
});
