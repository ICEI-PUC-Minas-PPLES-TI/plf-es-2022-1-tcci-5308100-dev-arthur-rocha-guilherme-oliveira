import {
  Uri,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
} from "vscode";
import { appInjector } from "../../inversify.config";
import { getCoverageHtmlForWebview } from "../core/coverage";
import { CoverageService } from "../core/coverage-service";
import { CoverageData } from "../models/coverage-data";

export class CoverageView implements WebviewViewProvider {
  private _view!: WebviewView;

  private coverageService = appInjector.get(CoverageService);
  private coverageData: CoverageData = new CoverageData(0, 0, true);

  constructor(private readonly _extensionUri: Uri) {}

  public resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    this._view.webview.html = getCoverageHtmlForWebview(
      this._view.webview,
      this._extensionUri,
      this.coverageData
    );

    this.coverageService.getCoverageData().subscribe((coverageData) => {
      this.coverageData = coverageData;
      this._view.webview.postMessage({
        type: "coverageData",
        data: coverageData,
      });
    });
  }

  public createView(): void {
    throw new Error("Method not implemented.");
  }

  public emitNewCoverageData(newCoverageData: CoverageData): void {
    throw new Error("Method not implemented.");
  }
}
