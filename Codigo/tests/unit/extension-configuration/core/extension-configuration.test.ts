import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

const mockedGetTemplate = jest.fn().mockReturnValue("fake-template");
jest.mock("../../../../src/utils/functions/template-parser", () => ({
  getTemplate: mockedGetTemplate,
}));

import { getExtensionConfigurationHtmlForWebview } from "../../../../src/extension-configuration/core/extension-configuration";

describe("getExtensionConfigurationHtmlForWebview", () => {
  it("should return coverage html for webview", () => {
    const webview = vscode.mocks.webview;

    const scriptUri = vscode.Uri.file("scriptUri");
    const styleMainUri = vscode.Uri.file("styleMainUri");
    const templateFileNameUri = vscode.Uri.file("templateFileName");
    const branchIconUri = vscode.Uri.file("branchIconUri");

    webview.asWebviewUri
      .mockReturnValueOnce(scriptUri)
      .mockReturnValueOnce(styleMainUri)
      .mockReturnValueOnce(templateFileNameUri)
      .mockReturnValueOnce(branchIconUri);

    const extensionUri = {};

    const result = getExtensionConfigurationHtmlForWebview(
      webview as any,
      extensionUri as any
    );

    expect(result).toBe("fake-template");
    expect(webview.asWebviewUri).toHaveBeenCalledTimes(4);
    expect(mockedGetTemplate).toHaveBeenNthCalledWith(
      1,
      webview,
      extensionUri,
      templateFileNameUri.fsPath,
      {
        title: "Extension Configuration",
        styles: [styleMainUri],
        scripts: [scriptUri],
        data: { branchIconUri: branchIconUri.toString() },
      }
    );
  });
});
