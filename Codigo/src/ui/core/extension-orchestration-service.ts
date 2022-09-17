import { commands, ExtensionContext } from "vscode";
import { CoverageService } from "../../coverage/core/coverage-service";
import { CoverageView } from "../../coverage/views/coverage-view";
import { ExtensionConfigurationService } from "../../extension-configuration/core/extension-configuration-service";
import { ConfigurationData } from "../../extension-configuration/models/configuration-data";
import { ConfigurationView } from "../../extension-configuration/views/configuration-view";
import { FileCoverageService } from "../../file-coverage/core/file-coverage-service";
import { FileCoverage } from "../../file-coverage/models/file-coverage";
import { appInjector } from "../../inversify.config";
import { ProjectConfigurationService } from "../../project-configuration/core/project-configuration-service";
import { ProjectConfiguration } from "../../project-configuration/models/project-configuration";
import { UncoveredLinesService } from "../../uncovered-lines/core/uncovered-lines-service";
import { UncoveredLinesTree } from "../../uncovered-lines/views/uncovered-lines-tree";
import { Line } from "../../uncovered-lines/models/line";
import { VisualStudioCode } from "../../visual-studio-code/visual-studio-code";
import { TestType } from "../enums/test-type";

//TO-DO: Add to UML project
export class ExtensionOrchestrationService {
  private coverageService = appInjector.get(CoverageService);
  private extensionConfigurationService = appInjector.get(
    ExtensionConfigurationService
  );
  private fileCoverageService = appInjector.get(FileCoverageService);
  private projectConfigurationService = appInjector.get(
    ProjectConfigurationService
  );
  private uncoveredLinesService = appInjector.get(UncoveredLinesService);
  private vsCode = appInjector.get(VisualStudioCode);
  private context = appInjector.get<ExtensionContext>("ExtensionContext");

  private actualFileCoverage!: FileCoverage;
  private actualConfigurationData!: ConfigurationData;
  private actualProjectConfiguration!: ProjectConfiguration;

  public emitNewProjectConfiguration(
    newProjectConfiguration: ProjectConfiguration
  ): void {
    this.actualProjectConfiguration = newProjectConfiguration;

    if (this.actualFileCoverage && this.actualConfigurationData) {
      this.coverageService.calculateCoverage(
        this.actualFileCoverage,
        newProjectConfiguration,
        this.actualConfigurationData
      );
    }

    this.extensionConfigurationService.changeRefBranch(
      newProjectConfiguration.refBranch
    );
  }

  public initViewData(): void {}

  public reloadTab(): void {}

  public runTest(testType: TestType): void {}

  public emitNewConfigurationData(
    newConfigurationData: ConfigurationData
  ): void {
    this.actualConfigurationData = newConfigurationData;

    if (this.actualFileCoverage) {
      this.vsCode.changeEditorDecoration(
        this.actualFileCoverage,
        newConfigurationData
      );

      this.uncoveredLinesService.setCurrentUncoveredLines(
        this.actualFileCoverage,
        newConfigurationData
      );
    }

    if (this.actualFileCoverage && this.actualProjectConfiguration) {
      this.coverageService.calculateCoverage(
        this.actualFileCoverage,
        this.actualProjectConfiguration,
        newConfigurationData
      );
    }
  }

  public fileFocusChange(): void {}

  public changeDefaultTestExecution(testType: TestType): void {}

  public emitNewFileCoverage(newFileCoverage: FileCoverage): void {
    this.actualFileCoverage = newFileCoverage;

    if (this.actualProjectConfiguration && this.actualConfigurationData) {
      this.coverageService.calculateCoverage(
        newFileCoverage,
        this.actualProjectConfiguration,
        this.actualConfigurationData
      );
    }

    if (this.actualConfigurationData) {
      this.vsCode.changeEditorDecoration(
        newFileCoverage,
        this.actualConfigurationData
      );

      this.uncoveredLinesService.setCurrentUncoveredLines(
        newFileCoverage,
        this.actualConfigurationData
      );
    }
  }

  public initApp() {
    this.registerCommands();
    this.registerViews();

    this.startProjectConfigurationObserver();

    this.startExtensionConfigurationObserver();

    this.startCoverageFileObserver();
  }

  private startCoverageFileObserver() {
    this.fileCoverageService.getFileCoverage().subscribe((fileCoverage) => {
      this.emitNewFileCoverage(fileCoverage);
    });
  }

  private startExtensionConfigurationObserver() {
    this.extensionConfigurationService
      .getConfigurationData()
      .subscribe((configurationData) => {
        this.emitNewConfigurationData(configurationData);
      });
  }

  private startProjectConfigurationObserver() {
    this.projectConfigurationService
      .getProjectConfigurationData()
      .subscribe((configurationData) => {
        this.emitNewProjectConfiguration(configurationData);
      });
  }

  private registerCommands() {
    let disposable = commands.registerCommand(
      "covering.open-file",
      (line: Line) => this.uncoveredLinesService.selectUncoveredLine(line)
    );

    this.context.subscriptions.push(disposable);
  }

  private registerViews() {
    ConfigurationView.createView();
    CoverageView.createView();
    UncoveredLinesTree.createView();
  }
}
