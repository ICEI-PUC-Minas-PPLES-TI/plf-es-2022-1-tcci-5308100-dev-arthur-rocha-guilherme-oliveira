import {
  ExtensionContext,
  WebviewView,
  WebviewViewProvider,
  window,
} from "vscode";
import { appInjector } from "../../inversify.config";
import { getExtensionConfigurationHtmlForWebview } from "../core/extension-configuration";
import { ExtensionConfigurationService } from "../core/extension-configuration-service";
import { ConfigurationData } from "../models/configuration-data";

export class ConfigurationView implements WebviewViewProvider {
  private _view!: WebviewView;
  private extensionConfigurationService = appInjector.get(
    ExtensionConfigurationService
  );
  private context = appInjector.get<ExtensionContext>("ExtensionContext");
  private extensionConfigurationData = new ConfigurationData(
    false,
    false,
    "",
    false
  );

  constructor() {}

  public resolveWebviewView(webviewView: WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    this._view.webview.html = getExtensionConfigurationHtmlForWebview(
      this._view.webview,
      this.context.extensionUri,
      this.extensionConfigurationData
    );

    this.extensionConfigurationService
      .getConfigurationData()
      .subscribe((extensionConfigurationData) => {
        this.extensionConfigurationData = extensionConfigurationData;
        this._view.webview.postMessage({
          type: "extensionConfigurationData",
          data: this.extensionConfigurationData,
        });
      });

    this._view.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "toggleIsGutterActive":
            this.toggleLineStatusVisibility();
            return;
          case "toggleIsBasedOnBranchChange":
            this.toggleCoverageBaseReferenceMode();
            return;
          case "toggleIsJustForFileInFocus":
            this.toggleCoveragePercentageMode();
            return;
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  public static createView(): void {
    const extensionConfigurationWebViewProvider = new ConfigurationView();
    window.registerWebviewViewProvider(
      "covering.config-view",
      extensionConfigurationWebViewProvider
    );
  }

  public toggleLineStatusVisibility(): void {
    this.extensionConfigurationService.toggleLineStatusVisibility();
  }

  public toggleCoveragePercentageMode(): void {
    this.extensionConfigurationService.toggleCoveragePercentageMode();
  }

  public toggleCoverageBaseReferenceMode(): void {
    this.extensionConfigurationService.toggleCoverageBaseReferenceMode();
  }
}
