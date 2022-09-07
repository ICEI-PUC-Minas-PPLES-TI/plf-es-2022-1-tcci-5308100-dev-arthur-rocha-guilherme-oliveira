import { injectable } from "inversify";
import { Observable, ReplaySubject } from "rxjs";
import { FileCoverage } from "../../file-coverage/models/file-coverage";
import { CoverageData } from "../models/coverage-data";
import { ProjectConfiguration } from "../../project-configuration/models/project-configuration";

@injectable()
export class CoverageService {
  private coverageData = new ReplaySubject<CoverageData>();

  public getCoverageData(): Observable<CoverageData> {
    return this.coverageData.asObservable(); //.pipe(startWith(new CoverageData(0, 0, true)));
  }

  public calculateCoverage(
    fileCoverage: FileCoverage,
    projectConfiguration: ProjectConfiguration
  ): void {
    const newCoverageData = CoverageData.updateCoverageData(
      fileCoverage,
      projectConfiguration
    );
    this.coverageData.next(newCoverageData);
  }
}
