import { readFile } from "fs";
import * as glob from "glob";
import { LcovBranch, LcovFile, LcovLine, source } from "lcov-parse";
import { TextEditor, Uri, window, workspace, WorkspaceFolder } from "vscode";
import { appInjector } from "../../inversify.config";
import { RangeLine } from "../../utils/models/range-line";
import { GitService } from "../../version-control/core/git-service";
import { BranchDiff } from "../../version-control/models/branch-diff";
import { LcovFileFinder } from "../../utils/functions/lcov-file-finder";
import { CoverageLines } from "./coverage-lines";
import { ConfigurationData } from "../../extension-configuration/models/configuration-data";

export type CompleteCoverageLines = {
  fileName: Uri;
  coverageLines: CoverageLines;
};

export class FileCoverage {
  public static readonly DEFAULT_LCOV_FILE_NAME = "lcov.info";

  private lcovFileFinder = appInjector.get(LcovFileFinder);
  private gitService = appInjector.get(GitService);

  constructor(private readonly lcovFiles: Map<string, LcovFile>) {}

  public async getAllCoverageLines(
    extensionConfiguration: ConfigurationData
  ): Promise<CompleteCoverageLines[]> {
    const lcovFiles = this.getLcovFiles().filter((lcovFile) => {
      if (extensionConfiguration.isJustForFileInFocus) {
        const activeTextEditor = window.activeTextEditor;

        if (activeTextEditor) {
          const lcovFileFsPath = Uri.file(lcovFile.file).fsPath;
          const activeTextEditorFsPath = activeTextEditor.document.uri.fsPath;

          return activeTextEditorFsPath.length > lcovFileFsPath.length
            ? activeTextEditorFsPath.includes(lcovFileFsPath)
            : lcovFileFsPath.includes(activeTextEditorFsPath);
        }

        return false;
      }

      return true;
    });

    const allFilesCoverageLines: CompleteCoverageLines[] = [];

    for (const lcovFile of lcovFiles) {
      const coverageLines = await this.getCoverageLinesForAFile(
        [lcovFile],
        lcovFile.file,
        extensionConfiguration.isBasedOnBranchChange,
        extensionConfiguration.referenceBranch
      );
      allFilesCoverageLines.push({
        fileName: Uri.file(lcovFile.file),
        coverageLines,
      });
    }

    return allFilesCoverageLines;
  }

  public getLcovFiles(): LcovFile[] {
    return Array.from(this.lcovFiles.values());
  }

  public async getCoverageLinesForEditor(
    textEditor: TextEditor,
    useGitDiff: boolean,
    referenceBranch: string
  ): Promise<CoverageLines> {
    const lcovFiles = this.lcovFileFinder.findLcovFilesForEditor(
      textEditor,
      this.lcovFiles
    );

    return this.getCoverageLinesForAFile(
      lcovFiles,
      textEditor.document.fileName,
      useGitDiff,
      referenceBranch
    );
  }

  private async getCoverageLinesForAFile(
    lcovFiles: LcovFile[],
    fileName: string,
    useGitDiff: boolean,
    referenceBranch: string
  ): Promise<CoverageLines> {
    const coverageLines = this.lcovFilesToCoverageLines(lcovFiles);

    if (!coverageLines) {
      return new CoverageLines();
    }

    if (useGitDiff) {
      const isFileDiff = await this.gitService.getIsCurrentFilesBranchDiff(
        referenceBranch,
        fileName
      );

      if (isFileDiff) {
        const diff = await this.gitService.getCurrentBranchDiff(
          referenceBranch
        );
        const branchDiff = BranchDiff.createBranchDiffFileLines(diff, fileName);

        return CoverageLines.createDiffCoverageLines(coverageLines, branchDiff);
      }

      return new CoverageLines();
    }

    return coverageLines;
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
      accumulator: RangeLine[],
      detail: LcovBranch | LcovLine
    ): RangeLine[] => {
      if (condition) {
        if (detail.line < 0) {
          return accumulator;
        }

        const lineRange = new RangeLine(detail.line);
        return [...accumulator, lineRange];
      }
      return accumulator;
    };

    const partial: RangeLine[] = lcovFile.branches.details.reduce<RangeLine[]>(
      (acc, detail) => rangeReducer(detail.taken === 0, acc, detail),
      []
    );

    const full: RangeLine[] = lcovFile.lines.details
      .reduce<RangeLine[]>(
        (acc, detail) => rangeReducer(detail.hit > 0, acc, detail),
        []
      )
      .filter(
        (fullRange) =>
          !partial.some((partialRange) => partialRange.isEqual(fullRange))
      );

    const none: RangeLine[] = lcovFile.lines.details
      .reduce<RangeLine[]>(
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

  public static async createNewCoverageFile(
    lcovFileName: string = FileCoverage.DEFAULT_LCOV_FILE_NAME
  ): Promise<FileCoverage> {
    const files = await this.findCoverageFiles(lcovFileName);
    const dataFiles = await this.loadDataFiles(files);
    const dataCoverage = await this.filesToLcovFiles(dataFiles);
    return new FileCoverage(dataCoverage);
  }

  private static async findCoverageFiles(
    lcovFileName: string
  ): Promise<Set<string>> {
    const files = await this.findCoverageInWorkspace(lcovFileName);

    if (!files.size) {
      window.showWarningMessage(
        "Could not find a Coverage file! Searched for " + lcovFileName
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

  private static async findCoverageForFileName(
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
    const coverageInWorkspaceFolders = await Promise.all(actions);
    let totalCoverage = new Set<string>();
    coverageInWorkspaceFolders.forEach((coverage) => {
      totalCoverage = new Set([...totalCoverage, ...coverage]);
    });
    return totalCoverage;
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

  private static load(path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      readFile(path, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data.toString());
      });
    });
  }

  private static lcovExtract(
    filename: string,
    lcovFile: string
  ): Promise<Map<string, LcovFile>> {
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

  private static handleError(system: string, message: string): void {
    console.log(
      `[${Date.now()}][coverageParser][${system}]: Error: ${message}`
    );
  }
}
