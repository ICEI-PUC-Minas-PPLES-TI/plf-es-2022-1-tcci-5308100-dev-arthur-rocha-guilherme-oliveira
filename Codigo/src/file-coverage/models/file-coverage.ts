import { readFile } from "fs";
import * as glob from "glob";
import { LcovBranch, LcovFile, LcovLine, source } from "lcov-parse";
import { Subject } from "rxjs";
import {
  FileSystemWatcher,
  TextEditor,
  window,
  workspace,
  WorkspaceFolder,
} from "vscode";
import { appInjector } from "../../inversify.config";
import { Line } from "../../utils/models/line";
import { GitService } from "../../version-control/core/git-service";
import { BranchDiff } from "../../version-control/models/branch-diff";
import { LcovFileFinder } from "../../visual-studio-code/lcov-file-finder";
import { CoverageLines } from "./coverage-lines";

export class FileCoverage {
  public static readonly DEFAULT_LCOV_FILE_NAME = "lcov.info";
  static coverageWatcher: FileSystemWatcher;
  static onFileChangeSubject: Subject<void>;

  private lcovFileFinder = appInjector.get(LcovFileFinder);
  private gitService = appInjector.get(GitService);

  constructor(private readonly lcovFiles: Map<string, LcovFile>) {}

  public getLcovFiles(): LcovFile[] {
    return Array.from(this.lcovFiles.values());
  }

  public async getCoverageLinesForEditor(
    textEditor: TextEditor,
    useGitDiff: boolean
  ): Promise<CoverageLines> {
    const lcovFiles = this.lcovFileFinder.findLcovFilesForEditor(
      textEditor,
      this.lcovFiles
    );

    const coverageLines = this.lcovFilesToCoverageLines(lcovFiles);

    if (!coverageLines) {
      return new CoverageLines();
    }

    const isFileDiff = await this.gitService.getIsCurrentFilesBranchDiff(
      textEditor.document.fileName,
      "master"
    );

    if (isFileDiff && useGitDiff) {
      const branchDiff = await this.gitService.getCurrentBranchDiff(
        textEditor.document.fileName,
        "master"
      );

      const filteredFull = await this.filterCoverageLines(
        coverageLines.full,
        branchDiff
      );

      const filteredPartial = await this.filterCoverageLines(
        coverageLines.partial,
        branchDiff
      );

      const filteredNone = await this.filterCoverageLines(
        coverageLines.none,
        branchDiff
      );

      return new CoverageLines(filteredFull, filteredPartial, filteredNone);
    }

    return coverageLines;
  }

  public static async createNewCoverageFile(): Promise<FileCoverage> {
    const files = await this.findCoverageFiles();
    const dataFiles = await this.loadDataFiles(files);
    const dataCoverage = await this.filesToLcovFiles(dataFiles);
    return new FileCoverage(dataCoverage);
  }

  private async filterCoverageLines(lines: Line[], branchDiff: BranchDiff) {
    return lines.filter((line) => {
      return branchDiff.diffLines.some((diffLine) => {
        return Line.equals(diffLine, line);
      });
    });
  }

  private static async findCoverageFiles(): Promise<Set<string>> {
    const files = await this.findCoverageInWorkspace(
      this.DEFAULT_LCOV_FILE_NAME
    );
    if (!files.size) {
      window.showWarningMessage(
        "Could not find a Coverage file! Searched for " +
          this.DEFAULT_LCOV_FILE_NAME
      );
      return new Set();
    }
    return files;
  }

  private static async findCoverageInWorkspace(fileName: string) {
    let files = new Set<string>();

    const coverage = await this.findCoverageForFileName(fileName);
    files = new Set([...files, ...coverage]);

    return files;
  }

  private static findCoverageForFileName(
    fileName: string
  ): Promise<Set<string>> {
    let actions: Array<Promise<Set<string>>> = new Array<
      Promise<Set<string>>
    >();
    if (workspace.workspaceFolders) {
      actions = workspace.workspaceFolders.map((workspaceFolder) => {
        return this.globFind(workspaceFolder, fileName);
      });
    }
    return Promise.all(actions).then((coverageInWorkspaceFolders) => {
      let totalCoverage = new Set<string>();
      coverageInWorkspaceFolders.forEach((coverage) => {
        totalCoverage = new Set([...totalCoverage, ...coverage]);
      });
      return totalCoverage;
    });
  }

  private static globFind(workspaceFolder: WorkspaceFolder, fileName: string) {
    return new Promise<Set<string>>((resolve) => {
      glob(
        `**/${fileName}`,
        {
          cwd: workspaceFolder.uri.fsPath,
          dot: true,
          ignore: "**/{node_modules}/**",
          realpath: true,
          strict: false,
        },
        (err: any, files: any) => {
          if (!files || !files.length) {
            if (err) {
              window.showWarningMessage(
                `An error occurred while looking for the coverage file ${err}`
              );
            }
            return resolve(new Set());
          }
          const setFiles = new Set<string>();
          files.forEach((file: any) => setFiles.add(file));
          return resolve(setFiles);
        }
      );
    });
  }

  private static async filesToLcovFiles(
    files: Map<string, string>
  ): Promise<Map<string, LcovFile>> {
    let coverages = new Map<string, LcovFile>();

    for (const file of files) {
      const fileName = file[0];
      const fileContent = file[1];
      const coverage = await this.lcovExtract(fileName, fileContent);

      coverages = new Map([...coverages, ...coverage]);
    }

    return coverages;
  }

  private static async loadDataFiles(
    files: Set<string>
  ): Promise<Map<string, string>> {
    const dataFiles = new Map<string, string>();
    for (const file of files) {
      dataFiles.set(file, await this.load(file));
    }
    return dataFiles;
  }

  private static load(path: string) {
    return new Promise<string>((resolve, reject) => {
      readFile(path, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data.toString());
      });
    });
  }

  private static lcovExtract(filename: string, lcovFile: string) {
    return new Promise<Map<string, LcovFile>>((resolve) => {
      const checkError = (err: string | null) => {
        if (err) {
          this.handleError("lcov-parse", `filename: ${filename} ${err}`);
          return resolve(new Map<string, LcovFile>());
        }
      };

      try {
        source(lcovFile, async (err, data) => {
          if (!data) {
            return resolve(new Map<string, LcovFile>());
          }

          checkError(err);
          const lcovFiles = await this.convertLcovFilesToMap(data);
          return resolve(lcovFiles);
        });
      } catch (error: any) {
        checkError(error);
      }
    });
  }

  private static async convertLcovFilesToMap(
    data: LcovFile[]
  ): Promise<Map<string, LcovFile>> {
    const lcovFiles = new Map<string, LcovFile>();
    const addToLcovFilesMap = async (lcovFile: LcovFile) => {
      lcovFiles.set(lcovFile.title + "::" + lcovFile.file, lcovFile);
    };

    const addPromises = data.map(addToLcovFilesMap);
    await Promise.all(addPromises);
    return lcovFiles;
  }

  private static handleError(system: string, message: string) {
    console.log(
      `[${Date.now()}][coverageParser][${system}]: Error: ${message}`
    );
  }

  private lcovFilesToCoverageLines(lcovFiles: LcovFile[]): CoverageLines {
    return lcovFiles.reduce<CoverageLines>(
      (coverageLines: CoverageLines, lcovFile: LcovFile) => {
        const actualCoverageLines = this.lcovFileToCoverageLines(lcovFile);

        if (!actualCoverageLines) {
          return coverageLines;
        }

        return {
          full: [...coverageLines.full, ...actualCoverageLines.full],
          partial: [...coverageLines.partial, ...actualCoverageLines.partial],
          none: [...coverageLines.none, ...actualCoverageLines.none],
        };
      },
      new CoverageLines()
    );
  }

  private lcovFileToCoverageLines(
    lcovFile: LcovFile
  ): CoverageLines | undefined {
    if (!lcovFile || !lcovFile.lines) {
      return;
    }

    const rangeReducer = (
      condition: boolean,
      accumulator: Line[],
      detail: LcovBranch | LcovLine
    ): Line[] => {
      if (condition) {
        if (detail.line < 0) {
          return accumulator;
        }

        const lineRange = new Line(detail.line - 1);
        return [...accumulator, lineRange];
      }
      return accumulator;
    };

    const partial: Line[] = lcovFile.branches.details.reduce<Line[]>(
      (acc, detail) => rangeReducer(detail.taken === 0, acc, detail),
      []
    );

    const full: Line[] = lcovFile.lines.details
      .reduce<Line[]>(
        (acc, detail) => rangeReducer(detail.hit > 0, acc, detail),
        []
      )
      .filter(
        (fullRange) =>
          !partial.some((partialRange) => partialRange.isEqual(fullRange))
      );

    const none: Line[] = lcovFile.lines.details
      .reduce<Line[]>(
        (acc, detail) => rangeReducer(detail.hit === 0, acc, detail),
        []
      )
      .filter(
        (noneRange) => !full.some((fullRange) => fullRange.isEqual(noneRange))
      );

    return {
      full,
      none,
      partial,
    };
  }
}
