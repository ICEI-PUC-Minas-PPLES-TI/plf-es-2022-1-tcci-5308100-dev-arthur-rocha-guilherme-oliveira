import { injectable } from "inversify";
import { LcovFile } from "lcov-parse";
import { basename } from "path";
import { TextEditor, Uri, workspace } from "vscode";
import {
  isPathAbsolute,
  makePathSearchable,
  normalizeFileName,
} from "./helpers";

@injectable()
export class LcovFileFinder {
  /**
   * Compare the paths using relative logic or absolute
   * @param textEditor editor with current active file
   * @param sections sections to compare against open editors
   */
  public findLcovFilesForEditor(
    textEditor: TextEditor,
    lcovFiles: Map<string, LcovFile>
  ): LcovFile[] {
    const lcovFilesArray = Array.from(lcovFiles.values());
    const res = this.calculateEditorData(textEditor);
    if (!res) {
      return [];
    }

    // Check each lcovFile against the currently active document filename
    const foundLcovFiles = lcovFilesArray.filter((lcovFile) =>
      this.checkLcovFile(lcovFile, res.relativePath, res.workspaceFolder)
    );
    if (!foundLcovFiles.length) {
      return [];
    }

    return foundLcovFiles;
  }

  public findLcovFilesForFile(
    fsPath: string,
    lcovFiles: Map<string, LcovFile>
  ): LcovFile[] {
    const lcovFilesArray = Array.from(lcovFiles.values());
    const res = this.calculateRelativePath(fsPath);
    if (!res) {
      return [];
    }

    const foundLcovFiles = lcovFilesArray.filter((lcovFile) =>
      this.checkLcovFile(lcovFile, res.relativePath, res.workspaceFolder)
    );
    if (!foundLcovFiles.length) {
      return [];
    }

    return foundLcovFiles;
  }

  /**
   * Checks for a matching lcovFile against the a given fileName
   * @param lcovFile data lcovFile to check against filename
   * @param editorFileRelative normalized relative path (against workspace folder) of editor filename, starts with ###
   * @param workspaceFolderName workspace folder name
   * @returns true if this lcovFile matches (applies to) the provided editorRelativeFile
   */
  private checkLcovFile(
    lcovFile: LcovFile,
    editorFileRelative: string,
    workspaceFolderName: string
  ): boolean {
    try {
      // Check if we need to swap any fragments of the file path with a remote fragment
      // IE: /var/www/ -> /home/me/
      const lcovFileFileName = this.resolveFileName(lcovFile.file);
      if (!isPathAbsolute(lcovFileFileName)) {
        return this.checkLcovFileRelative(lcovFileFileName, editorFileRelative);
      } else {
        return this.checkLcovFileAbsolute(
          lcovFileFileName,
          editorFileRelative,
          workspaceFolderName
        );
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Resolves remote file paths by removing those fragments and replacing with local ones.
   * EG: /var/www/project/file.js -> /home/dev/project/file.js
   * Note: this only runs if the developer adds a remotePathResolve setting
   * @param fileName lcovFile path
   */
  private resolveFileName(fileName: string): string {
    let potentialFileName = fileName;
    const remoteLocalPaths: string[] = [];
    if (remoteLocalPaths) {
      const remoteFragment = remoteLocalPaths[0];
      const localFragment = remoteLocalPaths[1];
      const paths = fileName.split(remoteFragment);

      // If we have a length of two we have a match and can swap the paths
      // Note: this is because split will give us an array of two with the first element
      // being an empty string and the second being the project path.
      if (paths.length === 2) {
        potentialFileName = localFragment + paths[1];
      }
    }
    return potentialFileName;
  }

  /**
   * Calculates relativePath and workspaceFolder for given TextEditor instance
   * Returned relativePath is normalized relative path (against workspace folder) of editor filename, starts with ###
   * Returned workspaceFolder is name of workspaceFolder
   * Ex. workspace: "c:/Workspace/testProject"
   *     editor file: "c:/workspace/testProject/src/com/MyCompany/lib/Bla.java"
   *     returned relativePath: "###src###com###mycompany###lib###bla.java"
   *     returned workspaceFolder: "testProject"
   * @param textEditor Instance of TextEditor
   */
  private calculateEditorData(
    textEditor: TextEditor
  ): { relativePath: string; workspaceFolder: string } | undefined {
    const fileName = textEditor.document.fileName;
    const editorFileUri = Uri.file(fileName);
    const workspaceFolder = workspace.getWorkspaceFolder(editorFileUri);
    if (!workspaceFolder) {
      return;
    } // file is not in workspace - skip it
    const workspaceFsPath = workspaceFolder.uri.fsPath;
    const editorFileAbs = normalizeFileName(fileName);
    const workspaceFile = normalizeFileName(workspaceFsPath);
    const editorFileRelative = editorFileAbs.substring(workspaceFile.length);
    const workspaceFolderName = normalizeFileName(basename(workspaceFsPath));
    return {
      relativePath: editorFileRelative,
      workspaceFolder: workspaceFolderName,
    };
  }

  private calculateRelativePath(
    fsPath: string
  ): { relativePath: string; workspaceFolder: string } | undefined {
    const fileName = fsPath;
    const editorFileUri = Uri.file(fileName);
    const workspaceFolder = workspace.getWorkspaceFolder(editorFileUri);
    if (!workspaceFolder) {
      return;
    }
    const workspaceFsPath = workspaceFolder.uri.fsPath;
    const editorFileAbs = normalizeFileName(fileName);
    const workspaceFile = normalizeFileName(workspaceFsPath);
    const editorFileRelative = editorFileAbs.substring(workspaceFile.length);
    const workspaceFolderName = normalizeFileName(basename(workspaceFsPath));
    return {
      relativePath: editorFileRelative,
      workspaceFolder: workspaceFolderName,
    };
  }

  /**
   * Returns true if relative lcovFile matches given editor file
   * @param lcovFileFileName relative lcovFile fileName
   * @param editorFileRelative normalized relative path (against workspace folder) of editor filename, starts with ###
   */
  private checkLcovFileRelative(
    lcovFileFileName: string,
    editorFileRelative: string
  ): boolean {
    // editorFileRelative must end with searchable & normalized lcovFile
    lcovFileFileName = makePathSearchable(lcovFileFileName);
    const lcovFileFileNormalized = normalizeFileName(lcovFileFileName);
    return editorFileRelative.endsWith(lcovFileFileNormalized);
  }

  /**
   * Returns true if absolute lcovFile matches given editor file
   * @param lcovFileFileName absolute lcovFile fileName
   * @param editorFileRelative normalized relative path (against workspace folder) of editor filename, starts with ###
   * @param workspaceFolderName workspace folder name
   */
  private checkLcovFileAbsolute(
    lcovFileFileName: string,
    editorFileRelative: string,
    workspaceFolderName: string
  ): boolean {
    // normalized lcovFile must end with /workspaceFolderName/editorFileRelative
    const lcovFileFileNormalized = normalizeFileName(lcovFileFileName);
    const matchPattern = `###${workspaceFolderName}${editorFileRelative}`;
    return lcovFileFileNormalized.endsWith(matchPattern);
  }
}
