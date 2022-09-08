import { exec } from "child_process";
import { injectable } from "inversify";
import { normalizeFileName } from "../../utils/functions/helpers";
import { Line } from "../../utils/models/line";
import { BranchDiff } from "../models/branch-diff";

@injectable()
export class GitService {
  private readonly GIT_COMMAND = "git diff";
  private readonly OPTION_NAME_ONLY = "--name-only";
  private readonly OPTION_UNIFIED = "-U0";

  public async getIsCurrentFilesBranchDiff(
    fileName: string,
    branch: string
  ): Promise<boolean> {
    const files = await this.execGitCommand(
      this.GIT_COMMAND,
      [this.OPTION_NAME_ONLY],
      [branch]
    );

    const filesDiff = files.split("\n").filter((file) => file.length);

    return filesDiff.some((fileDiff) => {
      let customFileDiff = normalizeFileName(fileDiff);
      let customFileName = normalizeFileName(fileName);

      return customFileName.match(customFileDiff);
    });
  }

  public async getCurrentBranchDiff(
    fileName: string,
    branch: string
  ): Promise<BranchDiff> {
    const diffs = await this.execGitCommand(
      this.GIT_COMMAND,
      [this.OPTION_UNIFIED],
      [branch]
    );

    let fsPatch: string = "";
    let lines: Line[] = [];

    const diffArray = diffs.split("diff --git a/");

    for (const diff of diffArray) {
      if (diff.length) {
        fsPatch = diff.split("\n")[0].split(" ")[0];
        fsPatch = normalizeFileName(fsPatch);

        const isDiffFile = normalizeFileName(fileName).match(fsPatch);

        if (isDiffFile) {
          diff.split("\n").forEach((line) => {
            if (line.startsWith("@@")) {
              const diffLinesNumbers = line
                .split(" ")[2]
                .replace("+", "")
                .split(",");
              const startLine = Number(diffLinesNumbers[0]);
              const endLine = Number(diffLinesNumbers[1] || 1);

              for (let i = 0; i < endLine; i++) {
                lines.push(new Line(startLine + i));
              }
            }
          });

          break;
        }
      }
    }

    return new BranchDiff(fileName, lines);
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
      // "c:\\Users\\Guilherme\\1@Eu\\plf-es-2022-1-tcci-5308100-dev-arthur-rocha-guilherme-oliveira\\Codigo";
      "/Users/arthurramaral/projects/puc/plf-es-2022-1-tcci-5308100-dev-arthur-rocha-guilherme-oliveira/Codigo";
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
