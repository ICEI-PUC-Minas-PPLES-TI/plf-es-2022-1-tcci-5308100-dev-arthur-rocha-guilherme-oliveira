import { Subscription } from "rxjs";
import { commands, ExtensionContext, window } from "vscode";
import { CoverageService } from "../../coverage/core/coverage-service";
import { CoverageView } from "../../coverage/views/coverage-view";
import { ExtensionConfigurationService } from "../../extension-configuration/core/extension-configuration-service";
import { ConfigurationData } from "../../extension-configuration/models/configuration-data";
import { ConfigurationView } from "../../extension-configuration/views/configuration-view";
import { FileCoverageService } from "../../file-coverage/core/file-coverage-service";
import { FileCoverage } from "../../file-coverage/models/file-coverage";
import { appInjector } from "../../inversify.config";
import { ProjectConfiguration } from "../../project-configuration/models/project-configuration";
import { UncoveredLinesTree } from "../../uncovered-lines/views/uncovered-lines-tree";
import { VisualStudioCode } from "../../visual-studio-code/visual-studio-code";
import { TestType } from "../enums/test-type";

//TO-DO: Add to UML project
export class ExtensionOrchestrationService {
  private fileCoverageService = appInjector.get(FileCoverageService);
  private coverageService = appInjector.get(CoverageService);
  private extensionConfigurationService = appInjector.get(
    ExtensionConfigurationService
  );
  private vsCode = appInjector.get(VisualStudioCode);
  private context = appInjector.get<ExtensionContext>("ExtensionContext");

  private actualFileCoverage!: FileCoverage;
  private actualConfigurationData!: ConfigurationData;

  public emitNewProjectConfiguration(
    newProjectConfiguration: ProjectConfiguration
  ): void { }

  public initViewData(): void { }

  public reloadTab(): void { }

  public runTest(testType: TestType): void { }

  public emitNewConfigurationData(
    newConfigurationData: ConfigurationData
  ): void {
    this.actualConfigurationData = newConfigurationData;

    this.vsCode.changeEditorDecoration(
      this.actualFileCoverage,
      newConfigurationData
    );
  }

  public fileFocusChange(): void { }

  public changeDefaultTestExecution(testType: TestType): void { }

  public emitNewFileCoverage(newFileCoverage: FileCoverage): void {
    this.actualFileCoverage = newFileCoverage;

    this.coverageService.calculateCoverage(newFileCoverage);
    this.vsCode.changeEditorDecoration(
      newFileCoverage,
      this.actualConfigurationData
    );
  }

  public initApp() {
    this.registerCommands();
    this.registerViews();

    this.fileCoverageService.getFileCoverage().subscribe((fileCoverage) => {
      this.emitNewFileCoverage(fileCoverage);
    });

    this.extensionConfigurationService
      .getConfigurationData()
      .subscribe((configurationData) => {
        this.emitNewConfigurationData(configurationData);
      });
  }

  private registerCommands() {
    let disposable = commands.registerCommand("covering.helloWorld", () => {
      window.showInformationMessage("Hello World from covering!");
    });

    this.context.subscriptions.push(disposable);
  }

  private registerViews() {
    ConfigurationView.createView();
    CoverageView.createView();

    const uncoveredLinesTreeDataProvider = new UncoveredLinesTree();
    window.createTreeView("covering.uncovered-lines-view", {
      treeDataProvider: uncoveredLinesTreeDataProvider,
    });
  }
}
