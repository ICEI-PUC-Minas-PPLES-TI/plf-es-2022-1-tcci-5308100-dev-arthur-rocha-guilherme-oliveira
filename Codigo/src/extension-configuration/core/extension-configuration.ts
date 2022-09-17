import * as vscode from "vscode";
import { getTemplate } from "../../utils/functions/template-parser";

export function getExtensionConfigurationHtmlForWebview(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
) {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "resources",
      "extension-configuration-view",
      "extension-configuration.js"
    )
  );

  const styleMainUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "resources",
      "extension-configuration-view",
      "extension-configuration.css"
    )
  );

  const templateFileName = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "resources",
      "extension-configuration-view",
      "extension-configuration.html"
    )
  );

  const branchIconUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "resources",
      "extension-configuration-view",
      "branch-icon.svg"
    )
  );

  const template = getTemplate(webview, extensionUri, templateFileName.fsPath, {
    title: "Extension Configuration",
    styles: [styleMainUri],
    scripts: [scriptUri],
    data: { branchIconUri: branchIconUri.toString() },
  });

  return template;
}
