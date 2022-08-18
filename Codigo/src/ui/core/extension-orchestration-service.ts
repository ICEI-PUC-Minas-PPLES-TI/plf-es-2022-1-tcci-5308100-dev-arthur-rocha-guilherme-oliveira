import { commands, ExtensionContext, window } from "vscode";
import { CoverageView } from "../../coverage/views/coverage-view";
import { ConfigurationData } from "../../extension-configuration/models/configuration-data";
import { ConfigurationView } from "../../extension-configuration/views/configuration-view";
import { FileCoverage } from "../../file-coverage/models/file-coverage";
import { ProjectConfiguration } from "../../project-configuration/models/project-configuration";
import { UncoveredLinesTree } from "../../uncovered-lines/views/uncovered-lines-tree";
import { TestType } from "../enums/test-type";

export class ExtensionOrchestrationService {
  constructor(private context: ExtensionContext) {}

  public emitNewProjectConfiguration(
    newProjectConfiguration: ProjectConfiguration
  ): void {}

  public initViewData(): void {}

  public reloadTab(): void {}

  public runTest(testType: TestType): void {}

  public emitNewConfigurationData(
    newConfigurationData: ConfigurationData
  ): void {}

  public fileFocusChange(): void {}

  public changeDefaultTestExecution(testType: TestType): void {}

  public emitNewFileCoverage(newFileCoverage: FileCoverage): void {}

  //TO-DO: Add to UML project
  public initApp() {
    this.registerCommands();
    this.registerViews();
  }

  //TO-DO: Add to UML project
  private registerCommands() {
    let disposable = commands.registerCommand("covering.helloWorld", () => {
      window.showInformationMessage("Hello World from covering!");
    });

    this.context.subscriptions.push(disposable);
  }

  //TO-DO: Add to UML project
  private registerViews() {
    const configTreeDataProvider = new ConfigurationView();
    window.createTreeView("covering.config-view", {
      treeDataProvider: configTreeDataProvider,
    });

    const webViewProvider = new CoverageView(this.context.extensionUri);
    window.registerWebviewViewProvider(
      "covering.coverage-view",
      webViewProvider
    );

    const uncoveredLinesTreeDataProvider = new UncoveredLinesTree();
    window.createTreeView("covering.uncovered-lines-view", {
      treeDataProvider: uncoveredLinesTreeDataProvider,
    });
  }
}
