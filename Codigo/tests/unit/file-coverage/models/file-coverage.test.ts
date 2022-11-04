import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import * as inversify from "../../../mocks/inversify";

import { FileCoverage } from "../../../../src/file-coverage/models/file-coverage";

describe("FileCoverage", () => {
  let fileCoverage: FileCoverage;

  beforeEach(() => {
    fileCoverage = new FileCoverage(inversify.mocks.getLcovFileMap());
  });

  it("should getCoverageLinesForEditor default", async () => {
    const coverageLines = await fileCoverage.getCoverageLinesForEditor(
      vscode.mocks.textEditor,
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
          start: {
            line: 0,
            character: 0,
          },
          lineNumber: 1,
        },
        {
          startLine: 1,
          startCharacter: 0,
          endLine: 1,
          endCharacter: 0,
          start: {
            line: 1,
            character: 0,
          },
          lineNumber: 2,
        },
        {
          startLine: 2,
          startCharacter: 0,
          endLine: 2,
          endCharacter: 0,
          start: {
            line: 2,
            character: 0,
          },
          lineNumber: 3,
        },
        {
          startLine: 14,
          startCharacter: 0,
          endLine: 14,
          endCharacter: 0,
          start: {
            line: 14,
            character: 0,
          },
          lineNumber: 15,
        },
      ],
      partial: [
        {
          startLine: 5,
          startCharacter: 0,
          endLine: 5,
          endCharacter: 0,
          start: {
            line: 5,
            character: 0,
          },
          lineNumber: 6,
        },
        {
          startLine: 10,
          startCharacter: 0,
          endLine: 10,
          endCharacter: 0,
          start: {
            line: 10,
            character: 0,
          },
          lineNumber: 11,
        },
      ],
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
        {
          startLine: 7,
          startCharacter: 0,
          endLine: 7,
          endCharacter: 0,
          start: {
            line: 7,
            character: 0,
          },
          lineNumber: 8,
        },
        {
          startLine: 11,
          startCharacter: 0,
          endLine: 11,
          endCharacter: 0,
          start: {
            line: 11,
            character: 0,
          },
          lineNumber: 12,
        },
      ],
    });

    expect(
      inversify.mocks.LcovFileFinder.findLcovFilesForEditor
    ).toHaveBeenCalledTimes(1);
    expect(
      inversify.mocks.GitService.getIsCurrentFilesBranchDiff
    ).not.toHaveBeenCalledTimes(1);
    expect(
      inversify.mocks.GitService.getCurrentBranchDiff
    ).not.toHaveBeenCalledTimes(1);
  });

  it("should getCoverageLinesForEditor using git diff", async () => {
    const coverageLines = await fileCoverage.getCoverageLinesForEditor(
      vscode.mocks.textEditor,
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
      inversify.mocks.LcovFileFinder.findLcovFilesForEditor
    ).toHaveBeenCalledTimes(1);
    expect(
      inversify.mocks.GitService.getIsCurrentFilesBranchDiff
    ).toHaveBeenCalledTimes(1);
    expect(
      inversify.mocks.GitService.getCurrentBranchDiff
    ).toHaveBeenCalledTimes(1);
  });
});
