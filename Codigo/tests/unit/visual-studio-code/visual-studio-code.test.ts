import * as vscode from "../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import * as inversify from "../../mocks/inversify";

import { VisualStudioCode } from "../../../src/visual-studio-code/visual-studio-code";
import { RangeLine } from "../../../src/utils/models/range-line";

describe("VisualStudioCode", () => {
  let visualStudioCode: VisualStudioCode;

  beforeEach(() => {
    visualStudioCode = new VisualStudioCode();
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(visualStudioCode).toBeDefined();
  });

  it("should render when default", async () => {
    const fileCoverage = inversify.mocks.stubs.getFileCoverage();
    const extensionConfiguration = inversify.mocks.stubs.getConfigurationData();

    await visualStudioCode.changeEditorDecoration(
      fileCoverage,
      extensionConfiguration
    );

    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenCalledTimes(6);
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      1,
      "fullCoverageDecorationType",
      []
    );
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      2,
      "noCoverageDecorationType",
      []
    );
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      3,
      "partialCoverageDecorationType",
      []
    );
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      4,
      "fullCoverageDecorationType",
      [
        new RangeLine(1),
        new RangeLine(2),
        new RangeLine(3),
        new RangeLine(14),
        new RangeLine(16),
      ]
    );
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      5,
      "noCoverageDecorationType",
      [new RangeLine(7), new RangeLine(11)]
    );
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      6,
      "partialCoverageDecorationType",
      [new RangeLine(6), new RangeLine(10)]
    );
  });

  it("should render but isGutterActive = false", async () => {
    const fileCoverage = inversify.mocks.stubs.getFileCoverage();
    const extensionConfiguration = inversify.mocks.stubs.getConfigurationData();
    extensionConfiguration.isGutterActive = false;

    await visualStudioCode.changeEditorDecoration(
      fileCoverage,
      extensionConfiguration
    );

    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenCalledTimes(3);
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      1,
      "fullCoverageDecorationType",
      []
    );
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      2,
      "noCoverageDecorationType",
      []
    );
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      3,
      "partialCoverageDecorationType",
      []
    );
  });

  it("should render but isJustForFileInFocus = true", async () => {
    const fileCoverage = inversify.mocks.stubs.getFileCoverage();
    const extensionConfiguration = inversify.mocks.stubs.getConfigurationData();
    extensionConfiguration.isJustForFileInFocus = true;

    await visualStudioCode.changeEditorDecoration(
      fileCoverage,
      extensionConfiguration
    );

    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenCalledTimes(6);
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      1,
      "fullCoverageDecorationType",
      []
    );
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      2,
      "noCoverageDecorationType",
      []
    );
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      3,
      "partialCoverageDecorationType",
      []
    );
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      4,
      "fullCoverageDecorationType",
      [
        new RangeLine(1),
        new RangeLine(2),
        new RangeLine(3),
        new RangeLine(14),
        new RangeLine(16),
      ]
    );
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      5,
      "noCoverageDecorationType",
      [new RangeLine(7), new RangeLine(11)]
    );
    expect(vscode.mocks.textEditor.setDecorations).toHaveBeenNthCalledWith(
      6,
      "partialCoverageDecorationType",
      [new RangeLine(6), new RangeLine(10)]
    );
  });

  it("should redirectEditorTo when default", () => {
    visualStudioCode.redirectEditorTo("file.ts");

    expect(vscode.window.showTextDocument).toHaveBeenCalledTimes(1);
    expect(vscode.window.showTextDocument).toHaveBeenCalledWith(
      vscode.Uri.file("tests/mocks/workspace/file.ts")
    );
  });

  it("should redirectEditorTo when not have an workspace", () => {
    vscode.workspace.workspaceFolders = undefined;
    visualStudioCode.redirectEditorTo("file.ts");

    expect(vscode.window.showTextDocument).not.toHaveBeenCalled();
  });

  it("should runScriptOnTerminal when default", () => {
    const command = "echo 'test'";
    visualStudioCode.runScriptOnTerminal(command);

    expect(vscode.mocks.terminal.sendText).toBeCalledWith(command);
    expect(vscode.window.createTerminal).not.toHaveBeenCalled();
    expect(vscode.mocks.terminal.show).toHaveBeenCalled();
  });

  it("should runScriptOnTerminal when not exist terminals on vscode", () => {
    vscode.window.terminals = [];
    const command = "echo 'test'";

    visualStudioCode.runScriptOnTerminal(command);

    expect(vscode.mocks.terminal.sendText).toBeCalledWith(command);
    expect(vscode.window.createTerminal).toHaveBeenCalled();
    expect(vscode.mocks.terminal.show).toHaveBeenCalled();
  });

  it("onDidChangeActiveTextEditor", (done) => {
    const fileCoverage = inversify.mocks.stubs.getFileCoverage();
    const extensionConfiguration = inversify.mocks.stubs.getConfigurationData();

    visualStudioCode.changeEditorDecoration(
      fileCoverage,
      extensionConfiguration
    );

    jest.clearAllMocks();

    const renderSpy = jest.spyOn(visualStudioCode as any, "render");

    visualStudioCode.getActiveEditorChange().subscribe(() => {
      expect(renderSpy).toBeCalledTimes(1);
      done();
    });

    vscode.triggers.window.onDidChangeActiveTextEditor();
  });

  it("should getFileWatcher when default", (done) => {
    const watcher = visualStudioCode.getFileWatcher("key", "filename");

    let counter = 0;
    watcher.subscribe(() => {
      counter++;
      if (counter === 3) {
        done();
      }
    });

    vscode.triggers.fileWatcher.onDidChange();
    vscode.triggers.fileWatcher.onDidCreate();
    vscode.triggers.fileWatcher.onDidDelete();
  });

  it("should getFileWatcher get same observable", () => {
    const watcher = visualStudioCode.getFileWatcher("key", "filename");
    const watcher2 = visualStudioCode.getFileWatcher("key", "filename");

    expect(watcher).toStrictEqual(watcher2);
  });

  it("should getFileWatcher get a different watcher for same key", () => {
    const watcher = visualStudioCode.getFileWatcher("same-key", "filename");
    const watcher2 = visualStudioCode.getFileWatcher(
      "same-key",
      "filename-other"
    );

    expect(watcher).not.toEqual(watcher2);
  });

  it("should cancelEditorFocusChangeObservation", () => {
    expect(
      vscode.triggers.window.onDidChangeActiveTextEditorCallBacks.length
    ).toBe(1);

    visualStudioCode.cancelEditorFocusChangeObservation();

    expect(
      vscode.triggers.window.onDidChangeActiveTextEditorCallBacks.length
    ).toBe(0);
  });
});
