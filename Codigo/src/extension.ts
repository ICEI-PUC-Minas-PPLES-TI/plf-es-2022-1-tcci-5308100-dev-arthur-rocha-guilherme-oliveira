import { ExtensionContext, window, commands } from "vscode";
import { CoveringMainTreeDataProvider } from "./coveringMainTreeDataProvider";
import { CoveringMainWebViewProvider } from "./coveringMainWebViewProvider";

export function activate(context: ExtensionContext) {
  console.log('Congratulations, your extension "covering" is now active!');

  const configTreeDataProvider = new CoveringMainTreeDataProvider();
  window.createTreeView("covering.config-view", {
    treeDataProvider: configTreeDataProvider,
  });

  const webViewProvider = new CoveringMainWebViewProvider(context.extensionUri);
  window.registerWebviewViewProvider("covering.coverage-view", webViewProvider);

  const uncoveredLinesTreeDataProvider = new CoveringMainTreeDataProvider();
  window.createTreeView("covering.uncovered-lines-view", {
    treeDataProvider: uncoveredLinesTreeDataProvider,
  });

  let disposable = commands.registerCommand("covering.helloWorld", () => {
    window.showInformationMessage("Hello World from covering!");
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

