import { FileCoverage } from "../models/file-coverage";
import { injectable } from "inversify";
import { Observable, ReplaySubject, Subscription } from "rxjs";
import { appInjector } from "../../inversify.config";
import { VisualStudioCode } from "../../visual-studio-code/visual-studio-code";

@injectable()
export class FileCoverageService {
  private readonly FILE_WATCHER_KEY = "coverage_file";
  private vscode = appInjector.get(VisualStudioCode);

  private readonly referenceFileName: string;

  private onFileCoverageFileChange: Observable<void>;

  private fileCoverageSubject!: ReplaySubject<FileCoverage>;

  private onFileCoverageChangeSubscription?: Subscription;

  constructor() {
    this.referenceFileName = FileCoverage.DEFAULT_LCOV_FILE_NAME;

    this.onFileCoverageFileChange = this.vscode.getFileWatcher(
      this.FILE_WATCHER_KEY,
      this.referenceFileName
    );
  }

  public getFileCoverage(lcovFileName?: string): Observable<FileCoverage> {
    if (!this.fileCoverageSubject) {
      this.fileCoverageSubject = new ReplaySubject<FileCoverage>();

      this.setFileChangeSubscribe(lcovFileName);

      this.fileChanged(lcovFileName);
    }

    return this.fileCoverageSubject.asObservable();
  }

  public addFileCoverageWatcher(lcovFileName: string): void {
    if (this.onFileCoverageChangeSubscription) {
      this.onFileCoverageChangeSubscription.unsubscribe();
    }

    this.onFileCoverageFileChange = this.vscode.getFileWatcher(
      this.FILE_WATCHER_KEY,
      lcovFileName
    );

    this.setFileChangeSubscribe(lcovFileName);

    if (this.fileCoverageSubject) {
      this.fileChanged(lcovFileName);
    }
  }

  private setFileChangeSubscribe(lcovFileName?: string) {
    this.onFileCoverageChangeSubscription =
      this.onFileCoverageFileChange.subscribe(() => {
        this.fileChanged(lcovFileName);
      });
  }

  private async fileChanged(lcovFileName?: string): Promise<void> {
    const newFileCoverage = await FileCoverage.createNewCoverageFile(
      lcovFileName
    );

    this.fileCoverageSubject.next(newFileCoverage);
  }
}
