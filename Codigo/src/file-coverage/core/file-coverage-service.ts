import { appInjector } from "../../inversify.config";
import { FileCoverage } from "../models/file-coverage";
import { injectable } from "inversify";
import { Observable, ReplaySubject, Subscription } from "rxjs";
import { VisualStudioCode } from "../../visual-studio-code/visual-studio-code";

@injectable()
export class FileCoverageService {
  private readonly FILE_WATCHER_KEY = "coverage_file";
  private vscode = appInjector.get(VisualStudioCode);

  private onFileCoverageFileChange!: Observable<void>;

  private fileCoverageSubject = new ReplaySubject<FileCoverage>();

  private onFileCoverageChangeSubscription?: Subscription;

  public getFileCoverage(): Observable<FileCoverage> {
    return this.fileCoverageSubject.asObservable();
  }

  public async addFileCoverageWatcher(lcovFileName: string): Promise<void> {
    this.onFileCoverageFileChange = this.vscode.getFileWatcher(
      this.FILE_WATCHER_KEY,
      lcovFileName
    );

    if (this.onFileCoverageChangeSubscription) {
      this.onFileCoverageChangeSubscription.unsubscribe();
    }

    this.onFileCoverageChangeSubscription =
      this.onFileCoverageFileChange.subscribe(() => {
        this.fileChanged(lcovFileName);
      });

    await this.fileChanged(lcovFileName);
  }

  private async fileChanged(lcovFileName?: string): Promise<void> {
    const newFileCoverage = await FileCoverage.createNewCoverageFile(
      lcovFileName
    );

    this.fileCoverageSubject.next(newFileCoverage);
  }
}
