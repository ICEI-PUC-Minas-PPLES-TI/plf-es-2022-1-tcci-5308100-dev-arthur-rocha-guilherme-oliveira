import { exec } from "child_process";
import { injectable } from "inversify";
import { LcovFile, LcovLine } from "lcov-parse";
import { Uri, workspace } from "vscode";
import { Line } from "../../utils/Line";
import { normalizeFileName } from "../../visual-studio-code/helpers";
import { BranchDiff } from "../models/branch-diff";

@injectable()
export class GitService {
  public async getIsCurrentFilesBranchDiff(fileName: string): Promise<boolean> {
    const files = await this.execGitCommand(
      "git diff",
      ["--name-only"],
      ["master"]
    );

    const filesDiff = files.split("\n").filter((file) => file.length);

    return filesDiff.some((fileDiff) => {
      fileDiff = fileDiff.replace(/\//g, "\\\\");
      return fileName.match(fileDiff);
    });
  }

  public async getCurrentBranchDiff(fileName: string): Promise<BranchDiff> {
    const diffs = await this.execGitCommand("git diff", ["-U0"], ["master"]);

    let fsPatch: string = "";
    let lines: Line[] = [];

    const diffArray = diffs.split("diff --git a/");

    for (const diff of diffArray) {
      if (diff.length) {
        fsPatch = diff.split("\n")[0].split(" ")[0].replace(/\//g, "\\\\");
        const isDiffFile = fileName.match(fsPatch);

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
      "c:\\Users\\Guilherme\\1@Eu\\plf-es-2022-1-tcci-5308100-dev-arthur-rocha-guilherme-oliveira\\Codigo";

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
