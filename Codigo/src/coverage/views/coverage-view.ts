import {
  ExtensionContext,
  WebviewView,
  WebviewViewProvider,
  window,
} from "vscode";
import { appInjector } from "../../inversify.config";
import { getCoverageHtmlForWebview } from "../core/coverage";
import { CoverageService } from "../core/coverage-service";
import { CoverageData } from "../models/coverage-data";

export class CoverageView implements WebviewViewProvider {
  private _view!: WebviewView;
  private context = appInjector.get<ExtensionContext>("ExtensionContext");

  private coverageService = appInjector.get(CoverageService);
  private coverageData = new CoverageData(0, 0);

  public resolveWebviewView(webviewView: WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    this._view.webview.html = getCoverageHtmlForWebview(
      this._view.webview,
      this.context.extensionUri,
      this.coverageData
    );

    this.coverageService.getCoverageData().subscribe((coverageData) => {
      this.coverageData = coverageData;
      this._view.webview.postMessage({
        type: "coverageData",
        data: coverageData,
      });
    });

    this._view.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "startingView":
          this._view.webview.postMessage({
            type: "coverageData",
            data: this.coverageData,
          });
      }
    });
  }

  public static createView(): void {
    const coverageWebViewProvider = new CoverageView();
    window.registerWebviewViewProvider(
      "covering.coverage-view",
      coverageWebViewProvider
    );
  }

  public emitNewCoverageData(newCoverageData: CoverageData): void {
    throw new Error("Method not implemented.");
  }
}
