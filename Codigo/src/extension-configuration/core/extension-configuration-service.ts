import { injectable } from "inversify";
import { Observable, ReplaySubject, startWith } from "rxjs";
import { window } from "vscode";
import { ConfigurationData } from "../models/configuration-data";

@injectable()
export class ExtensionConfigurationService {
  private configurationData = new ReplaySubject<ConfigurationData>();
  private actualState = new ConfigurationData(true, false, "master", false);

  public getConfigurationData(): Observable<ConfigurationData> {
    return this.configurationData.pipe(startWith(this.actualState));
  }
  public toggleLineStatusVisibility(): void {
    const newConfig = ConfigurationData.updateConfigurationData(
      this.actualState,
      { isGutterActive: !this.actualState.isGutterActive }
    );

    this.emitNemConfig(newConfig);
  }

  public toggleCoveragePercentageMode(): void {
    window.showErrorMessage("not implemented yet");
  }

  public toggleCoverageBaseReferenceMode(): void {
    const newConfig = ConfigurationData.updateConfigurationData(
      this.actualState,
      { isBasedOnBranchChange: !this.actualState.isBasedOnBranchChange }
    );

    this.emitNemConfig(newConfig);
  }

  private emitNemConfig(newConfigurationData: ConfigurationData): void {
    this.actualState = newConfigurationData;
    this.configurationData.next(newConfigurationData);
  }

  public changeRefBranch(refBranch: string = "master"): void {
    const newConfig = ConfigurationData.updateConfigurationData(
      this.actualState,
      { referenceBranch: refBranch }
    );

    this.emitNemConfig(newConfig);
  }
}
