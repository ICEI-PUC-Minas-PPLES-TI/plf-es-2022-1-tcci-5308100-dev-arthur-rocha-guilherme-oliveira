import { injectable } from "inversify";
import { Observable, ReplaySubject, startWith } from "rxjs";
import { FileCoverage } from "../../file-coverage/models/file-coverage";
import { appInjector } from "../../inversify.config";
import { CoverageData } from "../models/coverage-data";
import { VisualStudioCode } from "../../visual-studio-code/visual-studio-code";

@injectable()
export class CoverageService {
  private coverageData = new ReplaySubject<CoverageData>();

  public getCoverageData(): Observable<CoverageData> {
    return this.coverageData.asObservable(); //.pipe(startWith(new CoverageData(0, 0, true)));
  }

  public calculateCoverage(fileCoverage: FileCoverage): void {
    const newCoverageData = CoverageData.updateCoverageData(fileCoverage);
    this.coverageData.next(newCoverageData);
  }
}
