import { exec } from "child_process";
import { injectable } from "inversify";
import { workspace, window } from "vscode";
import { normalizeFileName } from "../../utils/functions/helpers";

@injectable()
export class GitService {
  private readonly GIT_COMMAND = "git diff";
  private readonly OPTION_NAME_ONLY = "--name-only";
  private readonly OPTION_UNIFIED = "-U0";
  private output = window.createOutputChannel("GitService");

  public async getIsCurrentFilesBranchDiff(
    branch: string,
    fileName: string
  ): Promise<boolean> {
    const filesDiff = await this.getFilesBranchDiff(branch);

    this.output.appendLine(`git diff: ${filesDiff.join("\n")}`);

    return filesDiff.some((fileDiff) => {
      let customFileDiff = normalizeFileName(fileDiff);
      let customFileName = normalizeFileName(fileName);

      if (customFileName.length > customFileDiff.length) {
        return customFileName.match(customFileDiff);
      }
      return customFileDiff.match(customFileName);
    });
  }

  public async getFilesBranchDiff(branch: string): Promise<string[]> {
    const files = await this.execGitCommand(
      this.GIT_COMMAND,
      [this.OPTION_NAME_ONLY],
      [branch]
    );

    return files.split("\n").filter((file) => file.length);
  }

  public async getCurrentBranchDiff(branch: string): Promise<string[]> {
    const diffs = await this.execGitCommand(
      this.GIT_COMMAND,
      [this.OPTION_UNIFIED],
      [branch]
    );

    return diffs.split("diff --git a/").filter((file) => file.length);
  }

  private async execGitCommand(
    cmd: string,
    options?: Array<string>,
    data?: Array<string>
  ): Promise<String> {
    const stringOptions = Array.isArray(options) ? options.join(" ") : "";
    const stringData = Array.isArray(data) ? data.join(" ") : "";

    const cwd = workspace.workspaceFolders
      ? workspace.workspaceFolders[0].uri.fsPath
      : __dirname;
    this.output.appendLine(`returning: '${cwd}' as workspaceFolder`);

    return await new Promise((resolve, reject) => {
      exec(
        `${cmd} ${stringOptions} ${stringData}`,
        { cwd: cwd },
        (error, stdout, stderr) => {
          if (error) {
            this.output.appendLine(`ERROR: git diff: ${stderr}`);
            console.error(stderr);
            reject(error);
          }

          this.output.appendLine(`SUCCESS: git diff: ${stdout}`);
          resolve(stdout);
        }
      );
    });
  }
}
