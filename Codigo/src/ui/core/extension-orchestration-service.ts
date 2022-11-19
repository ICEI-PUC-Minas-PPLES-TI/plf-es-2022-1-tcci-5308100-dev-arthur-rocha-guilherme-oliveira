import { appInjector } from "../../inversify.config";
import { commands, ExtensionContext } from "vscode";
import { CoverageService } from "../../coverage/core/coverage-service";
import { CoverageView } from "../../coverage/views/coverage-view";
import { ExtensionConfigurationService } from "../../extension-configuration/core/extension-configuration-service";
import { ConfigurationData } from "../../extension-configuration/models/configuration-data";
import { ConfigurationView } from "../../extension-configuration/views/configuration-view";
import { FileCoverageService } from "../../file-coverage/core/file-coverage-service";
import { FileCoverage } from "../../file-coverage/models/file-coverage";
import { ProjectConfigurationService } from "../../project-configuration/core/project-configuration-service";
import { ProjectConfiguration } from "../../project-configuration/models/project-configuration";
import { UncoveredLinesService } from "../../uncovered-lines/core/uncovered-lines-service";
import { UncoveredLinesTree } from "../../uncovered-lines/views/uncovered-lines-tree";
import { VisualStudioCode } from "../../visual-studio-code/visual-studio-code";
import { GitService } from "../../version-control/core/git-service";
import { LoggerManager } from "../../utils/logger/logger-manager";
import { Observable, ReplaySubject } from "rxjs";
import { CoverageData } from "../../coverage/models/coverage-data";

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
  private gitService = appInjector.get(GitService);
  private logger = appInjector
    .get(LoggerManager)
    .getServiceOutput("ExtensionOrchestrationService");

  private actualFileCoverage!: FileCoverage;
  private actualConfigurationData!: ConfigurationData;
  private actualProjectConfiguration!: ProjectConfiguration;

  public initApp(): Observable<void> {
    const subject = new ReplaySubject<void>();
    this.registerCommands();
    this.registerViews();

    this.initObservers().subscribe(() => {
      subject.next();
      subject.complete();
    });

    return subject;
  }

  public finishApp(): void {
    this.gitService.disablePreCommitHook();
  }

  private initObservers(): Observable<void> {
    const subject = new ReplaySubject<void>();
    this.startProjectConfigurationObserver().subscribe(() => {
      this.startExtensionConfigurationObserver().subscribe(() => {
        this.startCoverageFileObserver().subscribe(() => {
          this.startCoverageDataObserver().subscribe(() => {
            this.vsCode.getActiveEditorChange().subscribe(() => {
              this.fileFocusChange();
            });

            subject.next();
            subject.complete();
          });
        });
      });
    });
    return subject;
  }

  private registerCommands(): void {
    const openFileDisposable = commands.registerCommand(
      "covering.open-file",
      this.uncoveredLinesService.selectUncoveredLine.bind(this)
    );

    this.context.subscriptions.push(openFileDisposable);

    const generateProjectConfigurationFileDisposable = commands.registerCommand(
      "covering.generate-project-configuration-file",
      this.generateProjectConfigurationFileCommand.bind(this)
    );

    this.context.subscriptions.push(generateProjectConfigurationFileDisposable);

    const generateRunTestCoverageDisposable = commands.registerCommand(
      "covering.run-test",
      this.runTest.bind(this)
    );

    this.context.subscriptions.push(generateRunTestCoverageDisposable);
  }

  private registerViews() {
    ConfigurationView.createView();
    CoverageView.createView();
    UncoveredLinesTree.createView();
  }

  private startProjectConfigurationObserver(): Observable<void> {
    const subject = new ReplaySubject<void>();
    let isFirstInteraction = true;

    this.projectConfigurationService
      .getProjectConfigurationData()
      .subscribe((configurationData) => {
        this.emitNewProjectConfiguration(configurationData);

        if (isFirstInteraction) {
          isFirstInteraction = false;
          subject.next();
          subject.complete();
        }
      });
    return subject;
  }

  private startExtensionConfigurationObserver(): Observable<void> {
    const subject = new ReplaySubject<void>();
    let isFirstInteraction = true;

    this.extensionConfigurationService
      .getConfigurationData()
      .subscribe((configurationData) => {
        this.emitNewConfigurationData(configurationData);

        if (isFirstInteraction) {
          isFirstInteraction = false;
          subject.next();
          subject.complete();
        }
      });

    return subject;
  }

  private startCoverageFileObserver(): Observable<void> {
    const subject = new ReplaySubject<void>();
    let isFirstInteraction = true;

    this.fileCoverageService.getFileCoverage().subscribe((fileCoverage) => {
      this.emitNewFileCoverage(fileCoverage);

      if (isFirstInteraction) {
        isFirstInteraction = false;
        subject.next();
        subject.complete();
      }
    });

    return subject;
  }

  private startCoverageDataObserver(): Observable<void> {
    const subject = new ReplaySubject<void>();
    let isFirstInteraction = true;

    this.coverageService.getCoverageData().subscribe((coverageData) => {
      this.emitNewCoverageData(coverageData);

      if (isFirstInteraction) {
        isFirstInteraction = false;
        subject.next();
        subject.complete();
      }
    });

    return subject;
  }

  private emitNewCoverageData(coverageData: CoverageData): void {
    this.gitService.updateGitHookParams(coverageData);
  }

  public emitNewProjectConfiguration(
    newProjectConfiguration: ProjectConfiguration
  ): void {
    if (
      this.actualProjectConfiguration?.lcovFileName !==
      newProjectConfiguration?.lcovFileName
    ) {
      this.fileCoverageService.addFileCoverageWatcher(
        newProjectConfiguration.lcovFileName
      );
    }

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

    this.handlePrePushConfigChange(newProjectConfiguration);
  }

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

  private handlePrePushConfigChange(
    projectConfiguration: ProjectConfiguration
  ): void {
    if (projectConfiguration.usePrePushValidation) {
      this.gitService.enablePreCommitHook();
    } else {
      this.gitService.disablePreCommitHook();
    }
  }

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

  public reloadTab(): void {}

  public initViewData(): void {}

  public runTest(): void {
    if (
      this.actualProjectConfiguration.runTestCoverage === "" ||
      this.actualProjectConfiguration.runTestCoverage === undefined
    ) {
      this.logger.error("Please configure the command to run the tests", true);
      return;
    }

    this.vsCode.runScriptOnTerminal(
      this.actualProjectConfiguration.runTestCoverage
    );
  }

  public fileFocusChange(): void {
    if (!this.actualConfigurationData.isJustForFileInFocus) {
      return;
    }

    if (
      this.actualFileCoverage &&
      this.actualProjectConfiguration &&
      this.actualConfigurationData
    ) {
      this.coverageService.calculateCoverage(
        this.actualFileCoverage,
        this.actualProjectConfiguration,
        this.actualConfigurationData
      );
    }

    if (this.actualFileCoverage && this.actualConfigurationData) {
      this.uncoveredLinesService.setCurrentUncoveredLines(
        this.actualFileCoverage,
        this.actualConfigurationData
      );
    }
  }

  public async generateProjectConfigurationFileCommand(): Promise<void> {
    const result =
      await this.projectConfigurationService.requireConfigFileGeneration();

    if (!result.created) {
      this.logger.warn(
        "Project configuration file generation error: " + result.error,
        true
      );
    }

    this.vsCode.redirectEditorTo(ProjectConfiguration.DEFAULT_FILE_NAME);
  }
}
