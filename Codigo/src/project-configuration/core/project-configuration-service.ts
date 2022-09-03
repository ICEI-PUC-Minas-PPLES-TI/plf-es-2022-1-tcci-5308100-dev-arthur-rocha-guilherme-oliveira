import { injectable } from "inversify";
import { Observable, ReplaySubject } from "rxjs";
import { DefaultConfiguration } from "../../config";
import { appInjector } from "../../inversify.config";
import { File } from "../../uncovered-lines/models/file";
import { VisualStudioCode } from "../../visual-studio-code/visual-studio-code";
import { ProjectConfiguration } from "../models/project-configuration";

@injectable()
export class ProjectConfigurationService {
  private vscode = appInjector.get(VisualStudioCode);

  private readonly referenceFileName: string;

  private onProjectConfigurationsFileChange: Observable<void>;

  private projectConfigurationSubject!: ReplaySubject<ProjectConfiguration>;

  constructor() {
    this.referenceFileName = ProjectConfiguration.fileName;

    this.onProjectConfigurationsFileChange = this.vscode.getFileWatcher(
      this.referenceFileName
    );
  }

  public requireConfigFileGeneration(): boolean {
    return false;
  }

  public emitNewConfigurationFileCreated(newFile: File): void {}

  public getProjectConfigurationData(): Observable<ProjectConfiguration> {
    if (!this.projectConfigurationSubject) {
      this.projectConfigurationSubject =
        new ReplaySubject<ProjectConfiguration>();

      this.onProjectConfigurationsFileChange.subscribe(() => {
        this.fileChanged();
      });

      this.fileChanged();
    }

    return this.projectConfigurationSubject.asObservable();
  }

  public async fileChanged(): Promise<void> {
    const newProjectConfiguration =
      await ProjectConfiguration.createNewConfiguration();
    this.projectConfigurationSubject.next(newProjectConfiguration);
  }
}
