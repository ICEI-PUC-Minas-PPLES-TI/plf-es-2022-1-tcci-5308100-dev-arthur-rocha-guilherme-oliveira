import { Observable, ReplaySubject } from "rxjs";
import { appInjector } from "../../inversify.config";
import { File } from "../../uncovered-lines/models/file";
import { VisualStudioCode } from "../../visual-studio-code/visual-studio-code";
import { ProjectConfiguration } from "../models/project-configuration";
import { injectable } from "inversify";
import { fileSystemHelper } from "../../utils/functions/file-system-helper";
import { Uri, workspace } from "vscode";
import { LoggerManager } from "../../utils/logger/logger-manager";
import { FileCoverage } from "../../file-coverage/models/file-coverage";

@injectable()
export class ProjectConfigurationService {
  private readonly FILE_WATCHER_KEY = "project-configuration-file";
  private vscode = appInjector.get(VisualStudioCode);

  private readonly referenceFileName: string;

  private onProjectConfigurationsFileChange: Observable<void>;

  private projectConfigurationSubject!: ReplaySubject<ProjectConfiguration>;

  private logger = appInjector
    .get(LoggerManager)
    .getServiceOutput("ProjectConfigurationService");

  constructor() {
    this.logger.info("ProjectConfigurationService initialized");
    this.referenceFileName = ProjectConfiguration.DEFAULT_FILE_NAME;

    this.onProjectConfigurationsFileChange = this.vscode.getFileWatcher(
      this.FILE_WATCHER_KEY,
      this.referenceFileName
    );
    this.logger.info("File watcher initialized");
  }

  public async requireConfigFileGeneration(): Promise<{
    created: boolean;
    error?: string;
  }> {
    this.logger.info("Checking if config file exists");
    const fileExits = !!(await ProjectConfiguration.getFileData());

    if (!fileExits) {
      this.logger.info("Config file does not exist");
      const workspaceFolders = workspace.workspaceFolders;

      if (!workspaceFolders) {
        const error = "No workspace folder found";
        this.logger.error(error);
        return { created: false, error };
      }
      const workspaceFolder = workspaceFolders[0];

      const sampleProjectConfiguration = new ProjectConfiguration({
        minCoverage: 0.8,
        refBranch: "main",
        usePrePushValidation: false,
        lcovFileName: FileCoverage.DEFAULT_LCOV_FILE_NAME,
      });

      const fileContent = JSON.stringify(sampleProjectConfiguration, null, 2);

      const filePath = Uri.joinPath(
        workspaceFolder.uri,
        this.referenceFileName
      ).fsPath;
      await fileSystemHelper.writeStringFile(filePath, fileContent);
      this.logger.success("Config file created", true);

      return { created: true };
    }

    const error = "Config file already exists";
    this.logger.error(error);
    return { created: false, error };
  }

  public emitNewConfigurationFileCreated(newFile: File): void {}

  public getProjectConfigurationData(): Observable<ProjectConfiguration> {
    if (!this.projectConfigurationSubject) {
      this.logger.info("Creating new project configuration subject");

      this.projectConfigurationSubject =
        new ReplaySubject<ProjectConfiguration>();

      this.onProjectConfigurationsFileChange.subscribe(() => {
        this.logger.info("File changed");
        this.fileChanged();
      });

      this.fileChanged();
    }

    return this.projectConfigurationSubject.asObservable();
  }

  public async fileChanged(): Promise<void> {
    const newProjectConfiguration =
      await ProjectConfiguration.createNewConfiguration();

    this.logger.info("Emitting new project configuration");

    this.projectConfigurationSubject.next(newProjectConfiguration);
  }
}
