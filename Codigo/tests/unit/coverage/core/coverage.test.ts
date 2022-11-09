import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

const mockedGetTemplate = jest.fn().mockReturnValue("fake-template");
jest.mock("../../../../src/utils/functions/template-parser", () => ({
  getTemplate: mockedGetTemplate,
}));

import { getCoverageHtmlForWebview } from "../../../../src/coverage/core/coverage";

describe("getCoverageHtmlForWebview", () => {
  it("should return coverage html for webview", () => {
    const webview = vscode.mocks.webview;

    const scriptUri = vscode.Uri.file("scriptUri");
    const styleMainUri = vscode.Uri.file("styleMainUri");
    const templateFileNameUri = vscode.Uri.file("templateFileName");

    webview.asWebviewUri
      .mockReturnValueOnce(scriptUri)
      .mockReturnValueOnce(styleMainUri)
      .mockReturnValueOnce(templateFileNameUri);

    const extensionUri = {};
    const coverageData = {};

    const result = getCoverageHtmlForWebview(
      webview as any,
      extensionUri as any,
      coverageData as any
    );

    expect(result).toBe("fake-template");
    expect(webview.asWebviewUri).toHaveBeenCalledTimes(3);
    expect(mockedGetTemplate).toHaveBeenNthCalledWith(
      1,
      webview,
      extensionUri,
      templateFileNameUri.fsPath,
      {
        title: "Coverage",
        styles: [styleMainUri],
        scripts: [scriptUri],
        data: coverageData,
      }
    );
  });
});
