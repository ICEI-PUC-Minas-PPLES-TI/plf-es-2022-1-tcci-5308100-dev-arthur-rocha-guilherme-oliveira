import { exec } from "child_process";
import { injectable } from "inversify";
import { workspace } from "vscode";
import { normalizeFileName } from "../../utils/functions/helpers";

@injectable()
export class GitService {
  private readonly GIT_COMMAND_DIFF = "git diff";
  private readonly GIT_COMMAND_REV_PARSE = "git rev-parse";
  private readonly OPTION_NAME_ONLY = "--name-only";
  private readonly OPTION_IS_GIT_WORKSPACE = "--is-inside-work-tree";
  private readonly OPTION_UNIFIED = "-U0";
  private readonly OPTION_VERIFY = "--verify";

  public async getCurrentBranchDiff(branch: string): Promise<string[]> {
    const diffs = await this.execGitCommand(
      this.GIT_COMMAND_DIFF,
      [this.OPTION_UNIFIED],
      [branch]
    );

    return diffs.split("diff --git a/").filter((file) => file.length);
  }

  public async getIsCurrentFilesBranchDiff(
    branch: string,
    fileName: string
  ): Promise<boolean> {
    const filesDiff = await this.getFilesBranchDiff(branch);

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
      this.GIT_COMMAND_DIFF,
      [this.OPTION_NAME_ONLY],
      [branch]
    );

    return files.split("\n").filter((file) => file.length);
  }

  public async getIsGitWorkspace(): Promise<boolean> {
    const isGitWorkspace = await this.execGitCommand(
      this.GIT_COMMAND_REV_PARSE,
      [this.OPTION_IS_GIT_WORKSPACE]
    );

    return !!isGitWorkspace.match("true");
  }

  public async getIsBranch(refBranch: string): Promise<boolean> {
    const isbranch = await this.execGitCommand(
      this.GIT_COMMAND_REV_PARSE,
      [this.OPTION_IS_GIT_WORKSPACE],
      [refBranch]
    );

    if (isbranch.match("fatal")) {
      return false;
    }

    return true;
  }

  private async execGitCommand(
    cmd: string,
    options?: Array<string>,
    data?: Array<string>
  ): Promise<String> {
    const stringOptions = Array.isArray(options) ? options.join(" ") : "";
    const stringData = Array.isArray(data) ? data.join(" ") : "";

    if (!workspace.workspaceFolders) {
      return "";
    }

    const cwd = workspace.workspaceFolders
      ? workspace.workspaceFolders[0].uri.fsPath
      : __dirname;

    return await new Promise((resolve, reject): any => {
      exec(
        `${cmd} ${stringOptions} ${stringData}`,
        { cwd: cwd },
        (error, stdout, stderr) => {
          if (error) {
            console.error(stderr);
            resolve(error.message);
          }

          resolve(stdout);
        }
      );
    });
  }
}
