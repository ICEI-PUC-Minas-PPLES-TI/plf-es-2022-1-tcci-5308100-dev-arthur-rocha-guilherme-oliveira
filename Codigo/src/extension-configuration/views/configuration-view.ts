import { appInjector } from "../../inversify.config";
import {
  ExtensionContext,
  WebviewView,
  WebviewViewProvider,
  window,
} from "vscode";
import { GitService } from "../../version-control/core/git-service";
import { getExtensionConfigurationHtmlForWebview } from "../core/extension-configuration";
import { ExtensionConfigurationService } from "../core/extension-configuration-service";
import { ConfigurationData } from "../models/configuration-data";

export class ConfigurationView implements WebviewViewProvider {
  private _view!: WebviewView;
  private extensionConfigurationService = appInjector.get(
    ExtensionConfigurationService
  );
  private context = appInjector.get<ExtensionContext>("ExtensionContext");
  private gitService = appInjector.get(GitService);

  private extensionConfigurationData = new ConfigurationData(
    false,
    false,
    "",
    false
  );

  public static createView(): void {
    const extensionConfigurationWebViewProvider = new ConfigurationView();
    window.registerWebviewViewProvider(
      "covering.config-view",
      extensionConfigurationWebViewProvider
    );
  }

  public resolveWebviewView(webviewView: WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    this._view.webview.html = getExtensionConfigurationHtmlForWebview(
      this._view.webview,
      this.context.extensionUri
    );

    this.extensionConfigurationService
      .getConfigurationData()
      .subscribe(async (extensionConfigurationData) => {
        const isGitWorkspace = await this.gitService.getIsGitWorkspace();

        this.extensionConfigurationData = extensionConfigurationData;
        this._view.webview.postMessage({
          type: "extensionConfigurationData",
          data: this.extensionConfigurationData,
          isGitWorkspace: isGitWorkspace,
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

  private toggleLineStatusVisibility(): void {
    this.extensionConfigurationService.toggleLineStatusVisibility();
  }

  private toggleCoveragePercentageMode(): void {
    this.extensionConfigurationService.toggleCoveragePercentageMode();
  }

  private toggleCoverageBaseReferenceMode(): void {
    this.extensionConfigurationService.toggleCoverageBaseReferenceMode();
  }
}
