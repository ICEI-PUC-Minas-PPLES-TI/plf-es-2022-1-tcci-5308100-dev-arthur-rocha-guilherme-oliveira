import { readFile } from "fs";
import * as glob from "glob";
import { TextEditor, window, workspace, WorkspaceFolder } from "vscode";
import { LcovFile, source } from "lcov-parse";
import { appInjector } from "../../inversify.config";
import { SectionFinder } from "../../visual-studio-code/section-finder";

export class FileCoverage {
  private sectionFinder = appInjector.get(SectionFinder);

  constructor(private lcovFiles: Map<string, LcovFile>) {}

  public getLcovFiles(): Map<string, LcovFile> {
    return this.lcovFiles;
  }

  public getLcovFilesForEditor(textEditor: TextEditor): LcovFile[] {
    return this.sectionFinder.findSectionsForEditor(textEditor, this.lcovFiles);
  }

  public static async createNewCoverageFile(): Promise<FileCoverage> {
    const files = await this.findCoverageFiles();
    const dataFiles = await this.loadDataFiles(files);
    const dataCoverage = await this.filesToLcovFiles(dataFiles);
    return new FileCoverage(dataCoverage);
  }

  private static async findCoverageFiles(): Promise<Set<string>> {
    const fileName = "lcov.info";
    const files = await this.findCoverageInWorkspace(fileName);
    if (!files.size) {
      window.showWarningMessage(
        "Could not find a Coverage file! Searched for " + fileName
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
            // Show any errors if no file was found.
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
    // Load the files and convert into data strings
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // convert the array of LcovFiles into an unique map
    const addPromises = data.map(addToLcovFilesMap);
    await Promise.all(addPromises);
    return lcovFiles;
  }

  private static handleError(system: string, message: string) {
    console.log(
      `[${Date.now()}][coverageParser][${system}]: Error: ${message}`
    );
  }
}
