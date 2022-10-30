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

  private resolveFileName(fileName: string): string {
    let potentialFileName = fileName;
    const remoteLocalPaths: string[] = [];
    if (remoteLocalPaths) {
      const remoteFragment = remoteLocalPaths[0];
      const localFragment = remoteLocalPaths[1];
      const paths = fileName.split(remoteFragment);

      if (paths.length === 2) {
        potentialFileName = localFragment + paths[1];
      }
    }
    return potentialFileName;
  }

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

  private checkLcovFileRelative(
    lcovFileFileName: string,
    editorFileRelative: string
  ): boolean {
    // editorFileRelative must end with searchable & normalized lcovFile
    lcovFileFileName = makePathSearchable(lcovFileFileName);
    const lcovFileFileNormalized = normalizeFileName(lcovFileFileName);
    return editorFileRelative.endsWith(lcovFileFileNormalized);
  }

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
