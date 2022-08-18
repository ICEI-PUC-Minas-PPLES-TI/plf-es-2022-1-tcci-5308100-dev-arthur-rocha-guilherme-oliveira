import { File } from "../../uncovered-lines/models/file";
import { ProjectConfiguration } from "../models/project-configuration";

export class ProjectConfigurationService {
  public requireConfigFileGeneration(): boolean {
    return false;
  }

  public emitNewConfigurationFileCreated(newFile: File): void {}

  public getConfigurationData(): ProjectConfiguration {
    throw new Error("Method not implemented.");
  }

  public emitFileChanged(): void {}
}
