import { FileCoverage } from "../models/file-coverage";
import { injectable } from "inversify";
import { Observable, ReplaySubject } from "rxjs";

@injectable()
export class FileCoverageService {
  private fileCoverageSubject!: ReplaySubject<FileCoverage>;

  public getFileCoverage(): Observable<FileCoverage> {
    if (!this.fileCoverageSubject) {
      this.fileCoverageSubject = new ReplaySubject<FileCoverage>();

      FileCoverage.initiateLcovFileWatcher().subscribe(() => {
        this.fileChanged();
      });

      this.fileChanged();
    }

    return this.fileCoverageSubject.asObservable();
  }

  public async fileChanged(): Promise<void> {
    const newFileCoverage = await FileCoverage.createNewCoverageFile();
    this.fileCoverageSubject.next(newFileCoverage);
  }
}
