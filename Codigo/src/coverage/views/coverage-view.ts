import {
  SnippetString,
  Uri,
  WebviewView,
  WebviewViewProvider,
  window,
} from "vscode";
import { getCoverageHtmlForWebview } from "../core/coverage";
import { CoverageData } from "../models/coverage-data";

export class CoverageView implements WebviewViewProvider {
  private _view?: WebviewView;

  constructor(private readonly _extensionUri: Uri) {}

  public resolveWebviewView(webviewView: WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = getCoverageHtmlForWebview(
      webviewView.webview,
      this._extensionUri,
      {
        minCoveragePercentage: 0.8,
        coveragePercentage: 0.9,
        minCoverageReached: true,
      }
    );

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "colorSelected": {
          window.activeTextEditor?.insertSnippet(
            new SnippetString(`#${data.value}`)
          );
          break;
        }
      }
    });
  }

  public createView(): void {
    throw new Error("Method not implemented.");
  }

  public emitNewCoverageData(newCoverageData: CoverageData): void {
    throw new Error("Method not implemented.");
  }
}
