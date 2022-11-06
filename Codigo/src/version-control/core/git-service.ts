import { appInjector } from "../../inversify.config";
import { exec } from "child_process";
import { injectable } from "inversify";
import { ExtensionContext, Uri, workspace } from "vscode";
import { CoverageData } from "../../coverage/models/coverage-data";
import { fileSystemHelper } from "../../utils/functions/file-system-helper";
import { normalizeFileName } from "../../utils/functions/helpers";

@injectable()
export class GitService {
  private readonly GIT_COMMAND_DIFF = "git diff";
  private readonly GIT_COMMAND_REV_PARSE = "git rev-parse";
  private readonly OPTION_NAME_ONLY = "--name-only";
  private readonly OPTION_IS_GIT_WORKSPACE = "--is-inside-work-tree";
  private readonly OPTION_ABSOLUTE_GIT_DIR = "--absolute-git-dir";
  private readonly OPTION_UNIFIED = "-U0";
  private readonly OPTION_VERIFY = "--verify";

  private readonly GIT_HOOKS_COVERING_START_MARK = "# COVERING_SCRIPT_START";
  private readonly GIT_HOOKS_COVERING_END_MARK = "# COVERING_SCRIPT_END";
  private readonly SCRIPT_DEFINITION = "#!/bin/sh";

  private context = appInjector.get<ExtensionContext>("ExtensionContext");

  public async getCurrentBranchDiff(branch: string): Promise<string[]> {
    const diffs = await this.execCommand(
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
    const files = await this.execCommand(
      this.GIT_COMMAND_DIFF,
      [this.OPTION_NAME_ONLY],
      [branch]
    );

    return files.split("\n").filter((file) => file.length);
  }

  public async getIsGitWorkspace(): Promise<boolean> {
    const isGitWorkspace = await this.execCommand(this.GIT_COMMAND_REV_PARSE, [
      this.OPTION_IS_GIT_WORKSPACE,
    ]);

    return !!isGitWorkspace.match("true");
  }

  public async getIsBranch(refBranch: string): Promise<boolean> {
    const isBranch = await this.execCommand(
      this.GIT_COMMAND_REV_PARSE,
      [this.OPTION_IS_GIT_WORKSPACE],
      [refBranch]
    );

    if (isBranch.match("fatal")) {
      return false;
    }

    return true;
  }

  private async execCommand(
    cmd: string,
    options: Array<string>,
    data?: Array<string>
  ): Promise<String> {
    const stringOptions = options.join(" ");
    const stringData = data ? data.join(" ") : "";

    if (!workspace.workspaceFolders) {
      return "";
    }

    const cwd = workspace.workspaceFolders[0].uri.fsPath;

    return await new Promise((resolve): any => {
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

  private async getAbsoluteGitDir(): Promise<Uri | undefined> {
    if (!(await this.getIsGitWorkspace())) {
      return;
    }
    const gitDir = await this.execCommand(this.GIT_COMMAND_REV_PARSE, [
      this.OPTION_ABSOLUTE_GIT_DIR,
    ]);

    return Uri.parse(gitDir.toString().trim());
  }

  public async updateGitHookParams(
    newCoverageData: CoverageData
  ): Promise<void> {
    const gitDir = await this.getAbsoluteGitDir();
    if (!gitDir) {
      return;
    }

    const gitHooksCoverageParamsFile = Uri.joinPath(
      gitDir,
      "hooks",
      "min-coverage-reached"
    ).fsPath;

    const stringContent = `${newCoverageData.minCoverageReached}`;

    await fileSystemHelper.writeStringFile(
      gitHooksCoverageParamsFile,
      stringContent
    );
  }

  private async getPrePushScriptSample(): Promise<string> {
    const prePushScriptSampleFile = Uri.joinPath(
      this.context.extensionUri,
      "resources",
      "git-hooks",
      "pre-push-sample.sh"
    );
    const prePushScriptSampleBufferedContent = await fileSystemHelper.readFile(
      prePushScriptSampleFile.fsPath
    );
    const prePushScriptSampleStringContent = String(
      prePushScriptSampleBufferedContent
    );
    return prePushScriptSampleStringContent;
  }

  private removeCoveringScript(actualFileContent: any) {
    const replaceExpression = new RegExp(
      `${this.GIT_HOOKS_COVERING_START_MARK}[\\s\\S]+${this.GIT_HOOKS_COVERING_END_MARK}`,
      "g"
    );
    const remainingContent = actualFileContent
      .replace(replaceExpression, "")
      .trim();

    return remainingContent;
  }

  public async enablePreCommitHook() {
    const gitDir = await this.getAbsoluteGitDir();
    if (!gitDir) {
      return;
    }

    const gitPrePushFile = Uri.joinPath(gitDir, "hooks", "pre-push").fsPath;

    const prePushScriptSample =
      `${this.GIT_HOOKS_COVERING_START_MARK}\n\n` +
      `${await this.getPrePushScriptSample()}` +
      `\n\n${this.GIT_HOOKS_COVERING_END_MARK}`;

    if (!(await fileSystemHelper.exists(gitPrePushFile))) {
      const prePushScriptSampleForEmptyFile =
        `${this.SCRIPT_DEFINITION}\n\n` + `${prePushScriptSample}`;

      await fileSystemHelper.writeStringFile(
        gitPrePushFile,
        prePushScriptSampleForEmptyFile
      );

      await fileSystemHelper.chmod(gitPrePushFile, 0o777);
      return;
    }

    let actualFileBaseContent = String(
      await fileSystemHelper.readFile(gitPrePushFile)
    );

    if (actualFileBaseContent.match(this.GIT_HOOKS_COVERING_START_MARK)) {
      actualFileBaseContent = this.removeCoveringScript(actualFileBaseContent);
    }

    const stringContent =
      `${actualFileBaseContent}\n\n` + `${prePushScriptSample}`;

    await fileSystemHelper.writeStringFile(gitPrePushFile, stringContent);
  }

  public async disablePreCommitHook() {
    const gitDir = await this.getAbsoluteGitDir();
    if (!gitDir) {
      return;
    }

    const gitPrePushFile = Uri.joinPath(gitDir, "hooks", "pre-push").fsPath;

    if (!(await fileSystemHelper.exists(gitPrePushFile))) {
      return;
    }

    let actualFileBaseContent = String(
      await fileSystemHelper.readFile(gitPrePushFile)
    );

    if (actualFileBaseContent.match(this.GIT_HOOKS_COVERING_START_MARK)) {
      actualFileBaseContent = this.removeCoveringScript(actualFileBaseContent);
    }

    if (actualFileBaseContent === this.SCRIPT_DEFINITION) {
      await fileSystemHelper.deleteFile(gitPrePushFile);
      return;
    }

    await fileSystemHelper.writeStringFile(
      gitPrePushFile,
      actualFileBaseContent
    );
  }
}
