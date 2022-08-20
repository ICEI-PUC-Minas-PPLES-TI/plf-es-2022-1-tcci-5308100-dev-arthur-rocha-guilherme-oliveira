import { FileCoverage } from "../models/file-coverage";
import { inject, injectable } from "inversify";
import { Observable, ReplaySubject } from "rxjs";

@injectable()
export class FileCoverageService {
  private fileCoverage!: ReplaySubject<FileCoverage>;

  public getCoverageData(): Observable<FileCoverage> {
    if (!this.fileCoverage) {
      this.fileCoverage = new ReplaySubject<FileCoverage>();
      this.fileChanged();
    }

    return this.fileCoverage.asObservable();
  }

  public async fileChanged(): Promise<void> {
    const newFileCoverage = await FileCoverage.createNewCoverageFile();
    this.fileCoverage.next(newFileCoverage);
  }
}
