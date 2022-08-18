import * as vscode from "vscode";
import { getTemplate } from "./../../utils/template-parser";

interface CoverageData {
  minCoverage: number;
  actualCoverage: number;
}

export function getCoverageHtmlForWebview(
  webview: vscode.Webview,
  _extensionUri: vscode.Uri,
  coverageData: CoverageData
) {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      _extensionUri,
      "src",
      "views",
      "coverage",
      "coverage.js"
    )
  );

  const styleMainUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      _extensionUri,
      "src",
      "views",
      "coverage",
      "coverage.css"
    )
  );

  const templateFileName = webview.asWebviewUri(
    vscode.Uri.joinPath(
      _extensionUri,
      "src",
      "views",
      "coverage",
      "coverage.html"
    )
  );

  const template = getTemplate(
    webview,
    _extensionUri,
    templateFileName.fsPath,
    {
      title: "Coverage",
      styles: [styleMainUri],
      scripts: [scriptUri],
      data: coverageData,
    }
  );

  return template;
}

