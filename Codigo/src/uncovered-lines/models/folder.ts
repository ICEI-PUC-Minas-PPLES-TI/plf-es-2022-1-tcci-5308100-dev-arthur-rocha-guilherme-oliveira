import * as path from "path";
import { FileStat, FileType, Uri } from "vscode";
import { CompleteCoverageLines } from "../../file-coverage/models/file-coverage";
import { appInjector } from "../../inversify.config";
import { fileSystemHelper } from "../../utils/functions/file-system-helper";
import { normalizeFileName } from "../../utils/functions/helpers";
import { LoggerManager } from "../../utils/logger/logger-manager";
import { AppFileStat } from "../../utils/models/app-file-stat";
import { File } from "./file";

class DirectoryFile {
  constructor(public name: string, public type: FileType) {}
}

export class Folder {
  private logger = appInjector.get(LoggerManager).getServiceOutput("Folder");

  public folderName: string;
  public folders: Folder[] = [];
  public files: File[] = [];

  private constructor(public uri: Uri) {
    this.folderName =
      normalizeFileName(this.uri.fsPath).split("###").pop() || "";
  }

  public async getFolderChildren(
    completeCoverageLines: CompleteCoverageLines[]
  ): Promise<{
    folders: Folder[];
    files: File[];
  }> {
    const allChildren = await this.readDirectory(this.uri);
    const filteredChildren = allChildren.filter((child) =>
      completeCoverageLines.some((file) =>
        file.fileName.fsPath.includes(child.name)
      )
    );

    this.logger.info(`All children for: ${this.uri}\n${filteredChildren}`);

    const children: {
      folders: Folder[];
      files: File[];
    } = {
      folders: [],
      files: [],
    };

    for (const file of filteredChildren) {
      if (file.type === FileType.Directory) {
        const newFolder = await Folder.createRootFolder(
          Uri.file(path.join(this.uri.fsPath, file.name)),
          completeCoverageLines
        );
        if (newFolder.files.length > 0 || newFolder.folders.length > 0) {
          children.folders.push(newFolder);
        }
      }

      if (file.type === FileType.File) {
        const fileUri = Uri.file(path.join(this.uri.fsPath, file.name));

        this.logger.info(
          `Trying to find: ${fileUri.fsPath}\nin:${completeCoverageLines.map(
            (i) => i.fileName.fsPath
          )}`
        );

        const mappedFile = completeCoverageLines.find(
          (completeCoverageLine) => {
            return completeCoverageLine.fileName.fsPath.length >
              fileUri.fsPath.length
              ? completeCoverageLine.fileName.fsPath.includes(fileUri.fsPath)
              : fileUri.fsPath.includes(completeCoverageLine.fileName.fsPath);
          }
        );
        if (mappedFile) {
          const newFile = new File(
            Uri.file(path.join(this.uri.fsPath, file.name)),
            [...mappedFile.coverageLines.none],
            [...mappedFile.coverageLines.partial]
          );

          if (newFile.lines.length > 0) {
            children.files.push(newFile);
          }
        }
      }
    }

    this.logger.info(
      `Found ${children.files.length} files in the ${this.folderName} directory`
    );

    return children;
  }

  private async readDirectory(uri: Uri): Promise<DirectoryFile[]> {
    const children = await fileSystemHelper.readdir(uri.fsPath);

    const result: DirectoryFile[] = [];
    for (let i = 0; i < children.length; i++) {
      const childName = children[i];
      const stat = await this.createStatFile(path.join(uri.fsPath, childName));
      result.push(new DirectoryFile(childName, stat.type));
    }

    return Promise.resolve(result);
  }

  private async createStatFile(path: string): Promise<FileStat> {
    return new AppFileStat(await fileSystemHelper.stat(path));
  }

  public static async createRootFolder(
    uri: Uri,
    map: CompleteCoverageLines[]
  ): Promise<Folder> {
    const rootFolder = new Folder(uri);
    const children = await rootFolder.getFolderChildren(map);
    rootFolder.folders = children.folders;
    rootFolder.files = children.files;
    return rootFolder;
  }
}
