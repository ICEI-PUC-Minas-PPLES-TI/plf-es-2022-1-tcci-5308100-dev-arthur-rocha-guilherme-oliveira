import * as vscode from "vscode";
import { getTemplate } from "../../utils/functions/template-parser";
import { ConfigurationData } from "../models/configuration-data";

export function getExtensionConfigurationHtmlForWebview(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  configurationData: ConfigurationData
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

  const template = getTemplate(webview, extensionUri, templateFileName.fsPath, {
    title: "Extension Configuration",
    styles: [styleMainUri],
    scripts: [scriptUri],
    data: configurationData,
  });

  return template;
}
