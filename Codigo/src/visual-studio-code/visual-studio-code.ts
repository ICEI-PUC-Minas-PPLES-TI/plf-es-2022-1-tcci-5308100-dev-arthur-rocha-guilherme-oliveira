import { injectable } from "inversify";
import { Disposable, TextEditor, window } from "vscode";
import { DefaultConfiguration } from "../config";
import { ConfigurationData } from "../extension-configuration/models/configuration-data";
import { CoverageLines } from "../file-coverage/models/coverage-lines";
import { FileCoverage } from "../file-coverage/models/file-coverage";
import { appInjector } from "../inversify.config";

//TO-DO: Update documentation params
@injectable()
export class VisualStudioCode {
  private editorWatcher!: Disposable;
  private actualFileCoverage!: FileCoverage;
  private actualExtensionConfiguration!: ConfigurationData;

  constructor() {
    this.observeEditorFocusChange();
  }

  public redirectEditorTo(configFilePath: string): void { }

  public requestFileGeneration(): void { }

  public changeEditorDecoration(
    fileCoverage: FileCoverage,
    extensionConfiguration: ConfigurationData
  ): void {
    if (fileCoverage) {
      this.actualFileCoverage = fileCoverage;
    }

    if (extensionConfiguration) {
      this.actualExtensionConfiguration = extensionConfiguration;
    }

    if (this.actualFileCoverage) {
      this.render();
    }
  }

  public changeToCoveringTab(): void { }

  public runScriptOnTerminal(command: string): void { }

  public cancelEditorFocusChangeObservation(): void {
    if (this.editorWatcher) {
      this.editorWatcher.dispose();
    }
  }

  public observeEditorFocusChange(): void {
    this.cancelEditorFocusChangeObservation();

    this.editorWatcher = window.onDidChangeActiveTextEditor(() =>
      this.render()
    );
  }

  public criaNaRaizDoProjetoUmArquivoDeConfiguração(): void { }

  public alterarOArquivoDeConfiguraçãoActivateDev(): void { }

  private render(): void {
    this.removeDecorationsForEditors();

    if (!this.actualExtensionConfiguration.isGutterActive) {
      return;
    }

    const textEditors = window.visibleTextEditors;

    textEditors.forEach(async (textEditor) => {
      const coverageLines =
        await this.actualFileCoverage.getCoverageLinesForEditor(textEditor);

      this.setDecorationsForEditor(textEditor, coverageLines);
    });
  }

  private setDecorationsForEditor(editor: TextEditor, coverage: CoverageLines) {
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
}
