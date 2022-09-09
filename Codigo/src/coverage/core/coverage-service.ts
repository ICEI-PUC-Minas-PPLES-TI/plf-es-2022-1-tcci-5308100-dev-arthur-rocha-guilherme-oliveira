import { injectable } from "inversify";
import { Observable, ReplaySubject } from "rxjs";
import { FileCoverage } from "../../file-coverage/models/file-coverage";
import { CoverageData } from "../models/coverage-data";
import { ProjectConfiguration } from "../../project-configuration/models/project-configuration";
import { ConfigurationData } from "../../extension-configuration/models/configuration-data";

@injectable()
export class CoverageService {
  private coverageData = new ReplaySubject<CoverageData>();

  public getCoverageData(): Observable<CoverageData> {
    return this.coverageData.asObservable(); //.pipe(startWith(new CoverageData(0, 0, true)));
  }

  public async calculateCoverage(
    fileCoverage: FileCoverage,
    projectConfiguration: ProjectConfiguration,
    extensionConfiguration: ConfigurationData
  ): Promise<void> {
    const newCoverageData = await CoverageData.updateCoverageData(
      fileCoverage,
      projectConfiguration,
      extensionConfiguration
    );
    this.coverageData.next(newCoverageData);
  }
}
