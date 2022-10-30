import { appInjector } from "../../inversify.config";
import { injectable } from "inversify";
import { Observable, ReplaySubject } from "rxjs";
import { window } from "vscode";
import { GitService } from "../../version-control/core/git-service";
import { ConfigurationData } from "../models/configuration-data";

@injectable()
export class ExtensionConfigurationService {
  private gitService = appInjector.get(GitService);

  private configurationData = new ReplaySubject<ConfigurationData>();
  private actualState = new ConfigurationData(true, false, "", false, "");

  public getConfigurationData(): Observable<ConfigurationData> {
    return this.configurationData.asObservable();
  }

  public toggleLineStatusVisibility(): void {
    const newConfig = ConfigurationData.updateConfigurationData(
      this.actualState,
      { isGutterActive: !this.actualState.isGutterActive }
    );

    this.emitNewConfiguration(newConfig);
  }

  public toggleCoveragePercentageMode(): void {
    const newConfig = ConfigurationData.updateConfigurationData(
      this.actualState,
      { isJustForFileInFocus: !this.actualState.isJustForFileInFocus }
    );

    this.emitNewConfiguration(newConfig);
  }

  public toggleCoverageBaseReferenceMode(): void {
    const newConfig = ConfigurationData.updateConfigurationData(
      this.actualState,
      { isBasedOnBranchChange: !this.actualState.isBasedOnBranchChange }
    );

    this.emitNewConfiguration(newConfig);
  }

  private emitNewConfiguration(newConfigurationData: ConfigurationData): void {
    this.actualState = newConfigurationData;
    this.configurationData.next(newConfigurationData);
  }

  public async changeRefBranch(refBranch: string | undefined): Promise<void> {
    const isExistingRefBranch = refBranch
      ? await this.gitService.getIsBranch(refBranch)
      : false;

    if (isExistingRefBranch) {
      const newConfig = ConfigurationData.updateConfigurationData(
        this.actualState,
        { referenceBranch: refBranch }
      );

      this.emitNewConfiguration(newConfig);
    } else {
      window.showWarningMessage(
        `The branch "${refBranch}" does not exist in the repository`
      );
    }
  }
}
