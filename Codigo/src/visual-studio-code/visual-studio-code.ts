import { appInjector } from "../inversify.config";
import { injectable } from "inversify";
import { Observable, Subject } from "rxjs";
import { Disposable, TextEditor, Uri, window, workspace } from "vscode";
import { DefaultConfiguration } from "../config";
import { ConfigurationData } from "../extension-configuration/models/configuration-data";
import { CoverageLines } from "../file-coverage/models/coverage-lines";
import { FileCoverage } from "../file-coverage/models/file-coverage";

type FileWatcherSubject = {
  subject: Subject<void>;
  fileName: string;
  fileWatcher: Disposable;
};

@injectable()
export class VisualStudioCode {
  private editorWatcher!: Disposable;
  private actualFileCoverage!: FileCoverage;
  private actualExtensionConfiguration!: ConfigurationData;

  private fileWatchers: {
    [key: string]: FileWatcherSubject;
  } = {};
  private activeEditorChangeSubject: Subject<void> = new Subject<void>();

  constructor() {
    this.observeEditorFocusChange();
  }

  private async render(): Promise<void> {
    this.removeDecorationsForEditors();

    if (!this.actualExtensionConfiguration.isGutterActive) {
      return;
    }

    let textEditors: readonly TextEditor[] = [];

    if (this.actualExtensionConfiguration.isJustForFileInFocus) {
      const activeTextEditor = window.activeTextEditor;

      if (activeTextEditor) {
        textEditors = [activeTextEditor];
      }
    } else {
      textEditors = window.visibleTextEditors;
    }

    const renderEachEditor = textEditors.map(async (textEditor) => {
      const coverageLines =
        await this.actualFileCoverage.getCoverageLinesForEditor(
          textEditor,
          this.actualExtensionConfiguration.isBasedOnBranchChange,
          this.actualExtensionConfiguration.referenceBranch
        );

      this.setDecorationsForEditor(textEditor, coverageLines);
    });

    await Promise.all(renderEachEditor);
  }

  public redirectEditorTo(configFilePath: string): void {
    const workspaceFolders = workspace.workspaceFolders;

    if (!workspaceFolders) {
      return;
    }

    const workspaceFolder = workspaceFolders[0];
    window.showTextDocument(Uri.joinPath(workspaceFolder.uri, configFilePath));
  }

  public requestFileGeneration(): void {}

  public async changeEditorDecoration(
    fileCoverage: FileCoverage,
    extensionConfiguration: ConfigurationData
  ): Promise<void> {
    if (fileCoverage) {
      this.actualFileCoverage = fileCoverage;
    }

    if (extensionConfiguration) {
      this.actualExtensionConfiguration = extensionConfiguration;
    }

    if (this.actualFileCoverage) {
      await this.render();
    }
  }

  public changeToCoveringTab(): void {}

  public runScriptOnTerminal(command: string): void {
    if (window.terminals.length) {
      window.terminals[0].sendText(command);
    } else {
      window.createTerminal("covering").sendText(command);
    }

    window.terminals[0].show();
  }

  public cancelEditorFocusChangeObservation(): void {
    if (this.editorWatcher) {
      this.editorWatcher.dispose();
    }
  }

  public observeEditorFocusChange(): void {
    this.cancelEditorFocusChangeObservation();

    this.editorWatcher = window.onDidChangeActiveTextEditor(() => {
      this.render();
      this.activeEditorChangeSubject.next();
    });
  }

  public getActiveEditorChange(): Observable<void> {
    return this.activeEditorChangeSubject.asObservable();
  }

  private setDecorationsForEditor(
    editor: TextEditor,
    coverage: CoverageLines
  ): void {
    const config = appInjector.get(DefaultConfiguration);

    const {
      fullCoverageDecorationType,
      noCoverageDecorationType,
      partialCoverageDecorationType,
    } = config.textDecorationConfig;

    editor.setDecorations(fullCoverageDecorationType, coverage.full);
    editor.setDecorations(noCoverageDecorationType, coverage.none);
    editor.setDecorations(partialCoverageDecorationType, coverage.partial);
  }

  private removeDecorationsForEditors() {
    const config = appInjector.get(DefaultConfiguration);

    const {
      fullCoverageDecorationType,
      noCoverageDecorationType,
      partialCoverageDecorationType,
    } = config.textDecorationConfig;

    const editors = window.visibleTextEditors;
    editors.forEach((editor) => {
      editor.setDecorations(fullCoverageDecorationType, []);
      editor.setDecorations(noCoverageDecorationType, []);
      editor.setDecorations(partialCoverageDecorationType, []);
    });
  }

  public getFileWatcher(key: string, fileName: string): Observable<void> {
    const fileWatcher = this.fileWatchers[key];

    if (fileWatcher && fileWatcher.fileName === fileName) {
      return fileWatcher.subject.asObservable();
    }

    if (fileWatcher) {
      fileWatcher.subject.complete();
      fileWatcher.fileWatcher.dispose();
    }

    const newFileSubject = new Subject<void>();

    let baseDir = "**";
    if (workspace.workspaceFolders) {
      const workspaceFolders = workspace.workspaceFolders.map(
        (wf) => wf.uri.fsPath
      );
      baseDir = `{${workspaceFolders}}/${baseDir}`;
    }
    const blobPattern = `${baseDir}/${fileName}`;

    const newFileWatcher = workspace.createFileSystemWatcher(blobPattern);
    newFileWatcher.onDidChange(() => newFileSubject.next());
    newFileWatcher.onDidCreate(() => newFileSubject.next());
    newFileWatcher.onDidDelete(() => newFileSubject.next());

    const newFileWatcherSubject = {
      subject: newFileSubject,
      fileWatcher: newFileWatcher,
      fileName,
    };

    this.fileWatchers[key] = newFileWatcherSubject;
    return newFileWatcherSubject.subject.asObservable();
  }
}
