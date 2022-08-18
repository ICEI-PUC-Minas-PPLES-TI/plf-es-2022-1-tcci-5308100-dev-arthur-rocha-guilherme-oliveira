import * as vscode from "vscode";
import { getTemplate } from "../../utils/template-parser";
import { CoverageData } from "../models/coverage-data";

export function getCoverageHtmlForWebview(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  coverageData: CoverageData
) {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "src", "coverage", "views", "coverage.js")
  );

  const styleMainUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "src",
      "coverage",
      "views",
      "coverage.css"
    )
  );

  const templateFileName = webview.asWebviewUri(
    vscode.Uri.joinPath(
      extensionUri,
      "src",
      "coverage",
      "views",
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

