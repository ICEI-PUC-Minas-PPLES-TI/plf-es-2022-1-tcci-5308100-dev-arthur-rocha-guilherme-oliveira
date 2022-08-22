import { injectable } from "inversify";
import { Observable, ReplaySubject, startWith } from "rxjs";
import { ConfigurationData } from "../models/configuration-data";

@injectable()
export class ExtensionConfigurationService {
  private configurationData = new ReplaySubject<ConfigurationData>();
  private actualState = new ConfigurationData(true, false, "master", false);

  public gerConfigurationData(): Observable<ConfigurationData> {
    return this.configurationData.pipe(startWith(this.actualState));
  }
  public toggleLineStatusVisibility(): void {
    const newConfig = ConfigurationData.updateConfigurationData(
      this.actualState,
      { isGutterActive: !this.actualState.isGutterActive }
    );

    this.emitNemConfig(newConfig);
  }

  public toggleCoveragePercentageMode(): void {}

  public toggleCoverageBaseReferenceMode(): void {}

  private emitNemConfig(newConfigurationData: ConfigurationData): void {
    this.actualState = newConfigurationData;
    this.configurationData.next(newConfigurationData);
  }
}
