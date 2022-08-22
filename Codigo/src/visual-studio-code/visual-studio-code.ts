import { injectable } from "inversify";
import { LcovFile } from "lcov-parse";
import { Disposable, Range, TextEditor, window } from "vscode";
import { DefaultConfiguration } from "../config";
import { CoverageData } from "../coverage/models/coverage-data";
import { FileCoverage } from "../file-coverage/models/file-coverage";
import { appInjector } from "../inversify.config";
import { SectionFinder } from "./section-finder";

export interface ICoverageLines {
  full: Range[];
  partial: Range[];
  none: Range[];
}

@injectable()
export class VisualStudioCode {
  private editorWatcher!: Disposable;
  private actualFileCoverage!: FileCoverage;

  constructor() {
    this.observeEditorFocusChange();
  }

  public redirectEditorTo(configFilePath: string): void {}

  public requestFileGeneration(): void {}

  //TO-DO: Update documentation params
  public changeEditorDecoration(
    fileCoverage?: FileCoverage,
    showDecoration = true
  ): void {
    if (!showDecoration) {
      const textEditors = window.visibleTextEditors;

      //TO-DO: Extract to new method (duplicated code)
      textEditors.forEach((textEditor) => {
        this.removeDecorationsForEditor(textEditor);
      });

      return;
    }

    if (fileCoverage) {
      this.actualFileCoverage = fileCoverage;
    }

    if (this.actualFileCoverage) {
      this.render();
    }
  }

  public changeToCoveringTab(): void {}

  public runScriptOnTerminal(command: string): void {}

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

  public criaNaRaizDoProjetoUmArquivoDeConfiguração(): void {}

  public alterarOArquivoDeConfiguraçãoActivateDev(): void {}

  //TO-DO: All methods declared above have to be in documentation
  private render(): void {
    const textEditors = window.visibleTextEditors;
    const coverageLines: ICoverageLines = {
      full: [],
      none: [],
      partial: [],
    };

    //TO-DO: Extract to new method (duplicated code)
    textEditors.forEach((textEditor) => {
      this.removeDecorationsForEditor(textEditor);
    });

    textEditors.forEach((textEditor) => {
      coverageLines.full = [];
      coverageLines.none = [];
      coverageLines.partial = [];

      const foundSections =
        this.actualFileCoverage.getLcovFilesForEditor(textEditor);

      if (!foundSections.length) {
        return;
      }

      this.filterCoverage(foundSections, coverageLines);
      this.setDecorationsForEditor(textEditor, coverageLines);
    });
  }

  private setDecorationsForEditor(
    editor: TextEditor,
    coverage: ICoverageLines
  ) {
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

  private removeDecorationsForEditor(editor: TextEditor) {
    const config = appInjector.get(DefaultConfiguration);

    const {
      fullCoverageDecorationType,
      noCoverageDecorationType,
      partialCoverageDecorationType,
    } = config.textDecorationConfig;

    editor.setDecorations(fullCoverageDecorationType, []);
    editor.setDecorations(noCoverageDecorationType, []);
    editor.setDecorations(partialCoverageDecorationType, []);
  }

  private filterCoverage(sections: LcovFile[], coverageLines: ICoverageLines) {
    sections.forEach((section) => {
      this.filterLineCoverage(section, coverageLines);
      this.filterBranchCoverage(section, coverageLines);
    });
  }

  private filterLineCoverage(section: LcovFile, coverageLines: ICoverageLines) {
    if (!section || !section.lines) {
      return;
    }
    // TODO cleanup this area by using maps, filters, etc
    section.lines.details.forEach((detail) => {
      if (detail.line < 0) {
        return;
      }
      const lineRange = new Range(detail.line - 1, 0, detail.line - 1, 0);
      if (detail.hit > 0) {
        if (coverageLines.none.find((range) => range.isEqual(lineRange))) {
          // remove all none coverage, for this line, if one full exists
          coverageLines.none = coverageLines.none.filter(
            (range) => !range.isEqual(lineRange)
          );
        }
        coverageLines.full.push(lineRange);
      } else {
        const fullExists = coverageLines.full.find((range) =>
          range.isEqual(lineRange)
        );
        if (!fullExists) {
          // only add a none coverage if no full ones exist
          coverageLines.none.push(lineRange);
        }
      }
    });
  }

  private filterBranchCoverage(
    section: LcovFile,
    coverageLines: ICoverageLines
  ) {
    if (!section || !section.branches) {
      return;
    }
    // TODO cleanup this area by using maps, filters, etc
    section.branches.details.forEach((detail) => {
      if (detail.taken === 0) {
        if (detail.line < 0) {
          return;
        }
        const partialRange = new Range(detail.line - 1, 0, detail.line - 1, 0);
        if (coverageLines.full.find((range) => range.isEqual(partialRange))) {
          // remove full coverage if partial is a better match
          coverageLines.full = coverageLines.full.filter(
            (range) => !range.isEqual(partialRange)
          );
          coverageLines.partial.push(partialRange);
        }
      }
    });
  }
}
