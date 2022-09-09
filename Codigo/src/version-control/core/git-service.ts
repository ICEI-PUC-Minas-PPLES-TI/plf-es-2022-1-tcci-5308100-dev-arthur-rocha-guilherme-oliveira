import { exec } from "child_process";
import { injectable } from "inversify";
import { normalizeFileName } from "../../utils/functions/helpers";

@injectable()
export class GitService {
  private readonly GIT_COMMAND = "git diff";
  private readonly OPTION_NAME_ONLY = "--name-only";
  private readonly OPTION_UNIFIED = "-U0";

  public async getIsCurrentFilesBranchDiff(
    branch: string,
    fileName: string
  ): Promise<boolean> {
    const filesDiff = await this.getFilesBranchDiff(branch);

    return filesDiff.some((fileDiff) => {
      let customFileDiff = normalizeFileName(fileDiff);
      let customFileName = normalizeFileName(fileName);

      return customFileName.match(customFileDiff);
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

    //TO DO fix to take the workspace folder path
    const cwd =
      "c:\\Users\\Guilherme\\1@Eu\\plf-es-2022-1-tcci-5308100-dev-arthur-rocha-guilherme-oliveira\\Codigo";
    // "/Users/arthurramaral/projects/puc/plf-es-2022-1-tcci-5308100-dev-arthur-rocha-guilherme-oliveira/Codigo";
    return await new Promise((resolve, reject) => {
      exec(
        `${cmd} ${stringOptions} ${stringData}`,
        { cwd: cwd },
        (error, stdout, stderr) => {
          if (error) {
            console.error(stderr);
            reject(error);
          }
          resolve(stdout);
        }
      );
    });
  }
}
