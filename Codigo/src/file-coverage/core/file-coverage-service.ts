import { FileCoverage } from "../models/file-coverage";
import { injectable } from "inversify";
import { Observable, ReplaySubject } from "rxjs";
import { appInjector } from "../../inversify.config";
import { VisualStudioCode } from "../../visual-studio-code/visual-studio-code";

@injectable()
export class FileCoverageService {
  private vscode = appInjector.get(VisualStudioCode);

  private readonly referenceFileName: string;

  private onFileCoverageFileChange: Observable<void>;

  private fileCoverageSubject!: ReplaySubject<FileCoverage>;

  constructor() {
    this.referenceFileName = FileCoverage.DEFAULT_LCOV_FILE_NAME;

    this.onFileCoverageFileChange = this.vscode.getFileWatcher(
      this.referenceFileName
    );
  }

  public getFileCoverage(): Observable<FileCoverage> {
    if (!this.fileCoverageSubject) {
      this.fileCoverageSubject = new ReplaySubject<FileCoverage>();

      this.onFileCoverageFileChange.subscribe(() => {
        this.fileChanged();
      });

      this.fileChanged();
    }

    return this.fileCoverageSubject.asObservable();
  }

  private async fileChanged(): Promise<void> {
    const newFileCoverage = await FileCoverage.createNewCoverageFile();
    this.fileCoverageSubject.next(newFileCoverage);
  }
}
