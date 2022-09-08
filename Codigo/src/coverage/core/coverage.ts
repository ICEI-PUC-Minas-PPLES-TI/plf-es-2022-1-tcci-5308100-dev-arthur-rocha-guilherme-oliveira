import * as vscode from "vscode";
import { getTemplate } from "../../utils/functions/template-parser";
import { CoverageData } from "../models/coverage-data";

export function getCoverageHtmlForWebview(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  coverageData: CoverageData
) {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "resources",
      "coverage-view",
      "coverage.js"
    )
  );

  const styleMainUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "resources",
      "coverage-view",
      "coverage.css"
    )
  );

  const templateFileName = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "resources",
      "coverage-view",
      "coverage.html"
    )
  );

  const template = getTemplate(webview, extensionUri, templateFileName.fsPath, {
    title: "Coverage",
    styles: [styleMainUri],
    scripts: [scriptUri],
    data: coverageData,
  });

  return template;
}
