import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import { ExecException } from "child_process";

const mockChildProcess = { exec: jest.fn() };
jest.mock("child_process", () => mockChildProcess, { virtual: true });

import * as inversify from "../../../mocks/inversify";

import { GitService } from "../../../../src/version-control/core/git-service";
import { fileSystemHelper } from "../../../../src/utils/functions/file-system-helper";

describe("GitService", () => {
  let gitService: GitService;

  type ExecCallback = (
    error: ExecException | null,
    stdout: string,
    stderr: string
  ) => void;

  beforeEach(() => {
    gitService = new GitService();
  });

  it("should getCurrentBranchDiff default behavior", async () => {
    let callbackParam!: ExecCallback;
    mockChildProcess.exec.mockImplementationOnce(
      (cmd, opt, callback: ExecCallback) => {
        callbackParam = callback;
        callback(
          null,
          'diff --git a/Codigo/example/simple/.coveringconfig b/Codigo/example/simple/.coveringconfig\nindex 3ce8577..2883690 100644\n--- a/Codigo/example/simple/.coveringconfig\n+++ b/Codigo/example/simple/.coveringconfig\n@@ -3 +3 @@\n-  "refBranch": "master",\n+  "refBranch": "creating-tests",\ndiff --git a/Codigo/example/simple/coverage/coverage.json b/Codigo/example/simple/coverage/coverage.json\nindex af93471..ef0f0ad 100644\n--- a/Codigo/example/simple/coverage/coverage.json\n+++ b/Codigo/example/simple/cove…BRDA:43,9,1,0\n+BRDA:43,10,0,3\n+BRDA:43,10,1,3\n+BRDA:43,10,2,3\n+BRDA:44,11,0,3\n+BRDA:44,11,1,0\n+BRDA:45,12,0,3\n+BRDA:45,12,1,0\n+BRDA:46,13,0,3\n+BRDA:46,13,1,0\n+BRDA:49,14,0,0\n+BRDA:49,14,1,3\ndiff --git a/Codigo/example/simple/test-coverage.js b/Codigo/example/simple/test-coverage.js\nindex 8d0204a..34fee55 100644\n--- a/Codigo/example/simple/test-coverage.js\n+++ b/Codigo/example/simple/test-coverage.js\n@@ -13,0 +14 @@ module.exports.test = function test(testNumber) {\n+    console.log("notNull");\n',
          ""
        );
      }
    );

    const branchName = "branchName";
    const branchDiff = await gitService.getCurrentBranchDiff(branchName);

    expect(branchDiff).toEqual([
      'Codigo/example/simple/.coveringconfig b/Codigo/example/simple/.coveringconfig\nindex 3ce8577..2883690 100644\n--- a/Codigo/example/simple/.coveringconfig\n+++ b/Codigo/example/simple/.coveringconfig\n@@ -3 +3 @@\n-  "refBranch": "master",\n+  "refBranch": "creating-tests",\n',
      "Codigo/example/simple/coverage/coverage.json b/Codigo/example/simple/coverage/coverage.json\nindex af93471..ef0f0ad 100644\n--- a/Codigo/example/simple/coverage/coverage.json\n+++ b/Codigo/example/simple/cove…BRDA:43,9,1,0\n+BRDA:43,10,0,3\n+BRDA:43,10,1,3\n+BRDA:43,10,2,3\n+BRDA:44,11,0,3\n+BRDA:44,11,1,0\n+BRDA:45,12,0,3\n+BRDA:45,12,1,0\n+BRDA:46,13,0,3\n+BRDA:46,13,1,0\n+BRDA:49,14,0,0\n+BRDA:49,14,1,3\n",
      'Codigo/example/simple/test-coverage.js b/Codigo/example/simple/test-coverage.js\nindex 8d0204a..34fee55 100644\n--- a/Codigo/example/simple/test-coverage.js\n+++ b/Codigo/example/simple/test-coverage.js\n@@ -13,0 +14 @@ module.exports.test = function test(testNumber) {\n+    console.log("notNull");\n',
    ]);
    expect(mockChildProcess.exec).toHaveBeenNthCalledWith(
      1,
      "git diff -U0 branchName",
      { cwd: "tests/mocks/workspace" },
      callbackParam
    );
  });

  it("should getIsCurrentFilesBranchDiff default behavior", async () => {
    let callbackParam!: ExecCallback;
    mockChildProcess.exec.mockImplementationOnce(
      (cmd, opt, callback: ExecCallback) => {
        callbackParam = callback;
        callback(
          null,
          "Codigo/example/simple/.coveringconfig\nCodigo/example/simple/coverage/coverage.json\nCodigo/example/simple/coverage/lcov.info\nCodigo/example/simple/test-coverage.js\n",
          ""
        );
      }
    );

    const branchName = "branchName";
    const haveBranchDiff = await gitService.getIsCurrentFilesBranchDiff(
      branchName,
      "test-coverage.js"
    );

    expect(haveBranchDiff).toBeTruthy();
    expect(mockChildProcess.exec).toHaveBeenNthCalledWith(
      1,
      "git diff --name-only branchName",
      { cwd: "tests/mocks/workspace" },
      callbackParam
    );
  });

  it("should getFilesBranchDiff default behavior", async () => {
    let callbackParam!: ExecCallback;
    mockChildProcess.exec.mockImplementationOnce(
      (cmd, opt, callback: ExecCallback) => {
        callbackParam = callback;
        callback(
          null,
          "Codigo/example/simple/.coveringconfig\nCodigo/example/simple/coverage/coverage.json\nCodigo/example/simple/coverage/lcov.info\nCodigo/example/simple/test-coverage.js\n",
          ""
        );
      }
    );

    const branchName = "branchName";
    const haveBranchDiff = await gitService.getFilesBranchDiff(branchName);

    expect(haveBranchDiff).toEqual([
      "Codigo/example/simple/.coveringconfig",
      "Codigo/example/simple/coverage/coverage.json",
      "Codigo/example/simple/coverage/lcov.info",
      "Codigo/example/simple/test-coverage.js",
    ]);
    expect(mockChildProcess.exec).toHaveBeenNthCalledWith(
      1,
      "git diff --name-only branchName",
      { cwd: "tests/mocks/workspace" },
      callbackParam
    );
  });

  it("should getIsGitWorkspace default behavior", async () => {
    let callbackParam!: ExecCallback;
    mockChildProcess.exec.mockImplementationOnce(
      (cmd, opt, callback: ExecCallback) => {
        callbackParam = callback;
        callback(null, "true\n", "");
      }
    );

    const haveBranchDiff = await gitService.getIsGitWorkspace();

    expect(haveBranchDiff).toBeTruthy();
    expect(mockChildProcess.exec).toHaveBeenNthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree ",
      { cwd: "tests/mocks/workspace" },
      callbackParam
    );
  });

  it("should getIsBranch default behavior", async () => {
    let callbackParam!: ExecCallback;
    mockChildProcess.exec.mockImplementationOnce(
      (cmd, opt, callback: ExecCallback) => {
        callbackParam = callback;
        callback(null, "true\n55560e0d12bdf6733411d7ad70d35f674730c18b\n", "");
      }
    );

    const branchName = "branchName";
    const haveBranchDiff = await gitService.getIsBranch(branchName);

    expect(haveBranchDiff).toBeTruthy();
    expect(mockChildProcess.exec).toHaveBeenNthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree branchName",
      { cwd: "tests/mocks/workspace" },
      callbackParam
    );
  });

  it("should getIsBranch when branch does not exist", async () => {
    let callbackParam!: ExecCallback;
    mockChildProcess.exec.mockImplementationOnce(
      (cmd, opt, callback: ExecCallback) => {
        callbackParam = callback;
        callback(
          null,
          "'Command failed: git rev-parse --is-inside-work-tree creating-tests2\nfatal: ambiguous argument 'creating-tests2': unknown revision or path not in the working tree.\nUse '--' to separate paths from revisions, like this:\n'git <command> [<revision>...] -- [<file>...]'\n'",
          ""
        );
      }
    );

    const branchName = "branchName";
    const haveBranchDiff = await gitService.getIsBranch(branchName);

    expect(haveBranchDiff).toBeFalsy();
    expect(mockChildProcess.exec).toHaveBeenNthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree branchName",
      { cwd: "tests/mocks/workspace" },
      callbackParam
    );
  });

  it("should updateGitHookParams when branch does not exist", async () => {
    let firstCallbackParam!: ExecCallback;
    let secondCallbackParam!: ExecCallback;
    mockChildProcess.exec
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        firstCallbackParam = callback;
        callback(null, "true\n", "");
      })
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        secondCallbackParam = callback;
        callback(null, "/root/user/repo/.git\n", "");
      });

    const writeFileSpy = jest
      .spyOn(fileSystemHelper, "writeStringFile")
      .mockResolvedValue();

    const coverageData = inversify.mocks.stubs.getCoverageData();
    await gitService.updateGitHookParams(coverageData);

    expect(writeFileSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/min-coverage-reached",
      "true"
    );

    expect(mockChildProcess.exec).nthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree ",
      { cwd: "tests/mocks/workspace" },
      firstCallbackParam
    );
    expect(mockChildProcess.exec).lastCalledWith(
      "git rev-parse --absolute-git-dir ",
      { cwd: "tests/mocks/workspace" },
      secondCallbackParam
    );
  });

  it("should updateGitHookParams when is not a git repo", async () => {
    let callbackParam!: ExecCallback;
    mockChildProcess.exec.mockImplementationOnce(
      (cmd, opt, callback: ExecCallback) => {
        callbackParam = callback;
        callback(null, "false\n", "");
      }
    );

    const writeFileSpy = jest.spyOn(fileSystemHelper, "writeStringFile");

    const coverageData = inversify.mocks.stubs.getCoverageData();
    await gitService.updateGitHookParams(coverageData);

    expect(writeFileSpy).not.toHaveBeenCalled();

    expect(mockChildProcess.exec).nthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree ",
      { cwd: "tests/mocks/workspace" },
      callbackParam
    );
  });

  it("should disablePreCommitHook when file exist", async () => {
    let firstCallbackParam!: ExecCallback;
    let secondCallbackParam!: ExecCallback;
    mockChildProcess.exec
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        firstCallbackParam = callback;
        callback(null, "true\n", "");
      })
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        secondCallbackParam = callback;
        callback(null, "/root/user/repo/.git\n", "");
      });

    const existsSpy = jest
      .spyOn(fileSystemHelper, "exists")
      .mockResolvedValue(true);

    const readFileSpy = jest
      .spyOn(fileSystemHelper, "readFile")
      .mockResolvedValue(
        Buffer.from(`#!/bin/sh
        
        # COVERING_SCRIPT_START
        
        value=\`cat .git/hooks/min-coverage-reached\`
        
        if [ "$value" = "true" ] ; then
        echo "Coverage is good"
        exit 0
        elif [ "$value" = "false" ] ; then
        echo "Coverage is not good"
        exit 1
        else
        echo "Nothing to cover"
        exit 0
        fi
        
        exit 1
        
        # COVERING_SCRIPT_END`)
      );

    const deleteFileSpy = jest
      .spyOn(fileSystemHelper, "deleteFile")
      .mockResolvedValue();

    const writeStringFileSpy = jest.spyOn(fileSystemHelper, "writeStringFile");

    await gitService.disablePreCommitHook();

    expect(existsSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push"
    );
    expect(readFileSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push"
    );
    expect(deleteFileSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push"
    );
    expect(writeStringFileSpy).not.toHaveBeenCalled();

    expect(mockChildProcess.exec).nthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree ",
      { cwd: "tests/mocks/workspace" },
      firstCallbackParam
    );
    expect(mockChildProcess.exec).lastCalledWith(
      "git rev-parse --absolute-git-dir ",
      { cwd: "tests/mocks/workspace" },
      secondCallbackParam
    );
  });

  it("should disablePreCommitHook when file exist and have other script", async () => {
    let firstCallbackParam!: ExecCallback;
    let secondCallbackParam!: ExecCallback;
    mockChildProcess.exec
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        firstCallbackParam = callback;
        callback(null, "true\n", "");
      })
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        secondCallbackParam = callback;
        callback(null, "/root/user/repo/.git\n", "");
      });

    const existsSpy = jest
      .spyOn(fileSystemHelper, "exists")
      .mockResolvedValue(true);

    const readFileSpy = jest
      .spyOn(fileSystemHelper, "readFile")
      .mockResolvedValue(
        Buffer.from(`#!/bin/sh

        echo "Hello World"

        # COVERING_SCRIPT_START
        
        value=\`cat .git/hooks/min-coverage-reached\`
        
        if [ "$value" = "true" ] ; then
        echo "Coverage is good"
        exit 0
        elif [ "$value" = "false" ] ; then
        echo "Coverage is not good"
        exit 1
        else
        echo "Nothing to cover"
        exit 0
        fi
        
        exit 1
        
        # COVERING_SCRIPT_END`)
      );

    const deleteFileSpy = jest
      .spyOn(fileSystemHelper, "deleteFile")
      .mockResolvedValue();

    const writeStringFileSpy = jest.spyOn(fileSystemHelper, "writeStringFile");

    await gitService.disablePreCommitHook();

    expect(existsSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push"
    );
    expect(readFileSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push"
    );
    expect(deleteFileSpy).not.toHaveBeenCalled();
    expect(writeStringFileSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push",
      `#!/bin/sh

        echo "Hello World"`
    );

    expect(mockChildProcess.exec).nthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree ",
      { cwd: "tests/mocks/workspace" },
      firstCallbackParam
    );
    expect(mockChildProcess.exec).lastCalledWith(
      "git rev-parse --absolute-git-dir ",
      { cwd: "tests/mocks/workspace" },
      secondCallbackParam
    );
  });

  it("should disablePreCommitHook when file does not exists", async () => {
    let firstCallbackParam!: ExecCallback;
    let secondCallbackParam!: ExecCallback;
    mockChildProcess.exec
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        firstCallbackParam = callback;
        callback(null, "true\n", "");
      })
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        secondCallbackParam = callback;
        callback(null, "/root/user/repo/.git\n", "");
      });

    const existsSpy = jest
      .spyOn(fileSystemHelper, "exists")
      .mockResolvedValue(false);

    const readFileSpy = jest.spyOn(fileSystemHelper, "readFile");

    const deleteFileSpy = jest.spyOn(fileSystemHelper, "deleteFile");

    const writeStringFileSpy = jest.spyOn(fileSystemHelper, "writeStringFile");

    await gitService.disablePreCommitHook();

    expect(existsSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push"
    );
    expect(readFileSpy).not.toHaveBeenCalled();
    expect(deleteFileSpy).not.toHaveBeenCalled();
    expect(writeStringFileSpy).not.toHaveBeenCalled();

    expect(mockChildProcess.exec).nthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree ",
      { cwd: "tests/mocks/workspace" },
      firstCallbackParam
    );
    expect(mockChildProcess.exec).lastCalledWith(
      "git rev-parse --absolute-git-dir ",
      { cwd: "tests/mocks/workspace" },
      secondCallbackParam
    );
  });

  it("should disablePreCommitHook when is not a git repo", async () => {
    let callbackParam!: ExecCallback;
    mockChildProcess.exec.mockImplementationOnce(
      (cmd, opt, callback: ExecCallback) => {
        callbackParam = callback;
        callback(null, "false\n", "");
      }
    );

    const existsSpy = jest.spyOn(fileSystemHelper, "exists");

    const readFileSpy = jest.spyOn(fileSystemHelper, "readFile");

    const deleteFileSpy = jest.spyOn(fileSystemHelper, "deleteFile");

    const writeStringFileSpy = jest.spyOn(fileSystemHelper, "writeStringFile");

    await gitService.disablePreCommitHook();

    expect(existsSpy).not.toHaveBeenCalled();
    expect(readFileSpy).not.toHaveBeenCalled();
    expect(deleteFileSpy).not.toHaveBeenCalled();
    expect(writeStringFileSpy).not.toHaveBeenCalled();

    expect(mockChildProcess.exec).nthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree ",
      { cwd: "tests/mocks/workspace" },
      callbackParam
    );
  });

  it("should enablePreCommitHook when file exist", async () => {
    let firstCallbackParam!: ExecCallback;
    let secondCallbackParam!: ExecCallback;
    mockChildProcess.exec
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        firstCallbackParam = callback;
        callback(null, "true\n", "");
      })
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        secondCallbackParam = callback;
        callback(null, "/root/user/repo/.git\n", "");
      });

    const existsSpy = jest
      .spyOn(fileSystemHelper, "exists")
      .mockResolvedValue(true);

    const readFileSpy = jest
      .spyOn(fileSystemHelper, "readFile")
      .mockResolvedValueOnce(Buffer.from(`echo "Extension verification"`))
      .mockResolvedValueOnce(
        Buffer.from(`#!/bin/sh
        
        # COVERING_SCRIPT_START
        
        value=\`cat .git/hooks/min-coverage-reached\`
        
        if [ "$value" = "true" ] ; then
        echo "Coverage is good"
        exit 0
        elif [ "$value" = "false" ] ; then
        echo "Coverage is not good"
        exit 1
        else
        echo "Nothing to cover"
        exit 0
        fi
        
        exit 1
        
        # COVERING_SCRIPT_END`)
      );

    const deleteFileSpy = jest.spyOn(fileSystemHelper, "deleteFile");

    const writeStringFileSpy = jest
      .spyOn(fileSystemHelper, "writeStringFile")
      .mockResolvedValue();

    await gitService.enablePreCommitHook();

    expect(existsSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push"
    );
    expect(readFileSpy).toHaveBeenNthCalledWith(
      1,
      "/path/to/extension/resources/git-hooks/pre-push-sample.sh"
    );
    expect(readFileSpy).lastCalledWith("/root/user/repo/.git/hooks/pre-push");
    expect(deleteFileSpy).not.toHaveBeenCalled();
    expect(writeStringFileSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push",
      '#!/bin/sh\n\n# COVERING_SCRIPT_START\n\necho "Extension verification"\n\n# COVERING_SCRIPT_END'
    );

    expect(mockChildProcess.exec).nthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree ",
      { cwd: "tests/mocks/workspace" },
      firstCallbackParam
    );
    expect(mockChildProcess.exec).lastCalledWith(
      "git rev-parse --absolute-git-dir ",
      { cwd: "tests/mocks/workspace" },
      secondCallbackParam
    );
  });

  it("should enablePreCommitHook when file exist and have other script", async () => {
    let firstCallbackParam!: ExecCallback;
    let secondCallbackParam!: ExecCallback;
    mockChildProcess.exec
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        firstCallbackParam = callback;
        callback(null, "true\n", "");
      })
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        secondCallbackParam = callback;
        callback(null, "/root/user/repo/.git\n", "");
      });

    const existsSpy = jest
      .spyOn(fileSystemHelper, "exists")
      .mockResolvedValue(true);

    const readFileSpy = jest
      .spyOn(fileSystemHelper, "readFile")
      .mockResolvedValueOnce(Buffer.from(`echo "Extension verification"`))
      .mockResolvedValueOnce(
        Buffer.from(`#!/bin/sh

        echo "Hello World"`)
      );

    const deleteFileSpy = jest.spyOn(fileSystemHelper, "deleteFile");

    const writeStringFileSpy = jest
      .spyOn(fileSystemHelper, "writeStringFile")
      .mockResolvedValue();

    await gitService.enablePreCommitHook();

    expect(existsSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push"
    );
    expect(readFileSpy).toHaveBeenNthCalledWith(
      1,
      "/path/to/extension/resources/git-hooks/pre-push-sample.sh"
    );
    expect(readFileSpy).lastCalledWith("/root/user/repo/.git/hooks/pre-push");
    expect(deleteFileSpy).not.toHaveBeenCalled();
    expect(writeStringFileSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push",
      '#!/bin/sh\n\n        echo "Hello World"\n\n# COVERING_SCRIPT_START\n\necho "Extension verification"\n\n# COVERING_SCRIPT_END'
    );

    expect(mockChildProcess.exec).nthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree ",
      { cwd: "tests/mocks/workspace" },
      firstCallbackParam
    );
    expect(mockChildProcess.exec).lastCalledWith(
      "git rev-parse --absolute-git-dir ",
      { cwd: "tests/mocks/workspace" },
      secondCallbackParam
    );
  });

  it("should enablePreCommitHook when file does not exists", async () => {
    let firstCallbackParam!: ExecCallback;
    let secondCallbackParam!: ExecCallback;
    mockChildProcess.exec
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        firstCallbackParam = callback;
        callback(null, "true\n", "");
      })
      .mockImplementationOnce((cmd, opt, callback: ExecCallback) => {
        secondCallbackParam = callback;
        callback(null, "/root/user/repo/.git\n", "");
      });

    const existsSpy = jest
      .spyOn(fileSystemHelper, "exists")
      .mockResolvedValue(false);

    const readFileSpy = jest
      .spyOn(fileSystemHelper, "readFile")
      .mockResolvedValueOnce(Buffer.from(`echo "Extension verification"`));

    const deleteFileSpy = jest.spyOn(fileSystemHelper, "deleteFile");

    const chmodSpy = jest.spyOn(fileSystemHelper, "chmod").mockResolvedValue();

    const writeStringFileSpy = jest
      .spyOn(fileSystemHelper, "writeStringFile")
      .mockResolvedValue();

    await gitService.enablePreCommitHook();

    expect(existsSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push"
    );
    expect(readFileSpy).toHaveBeenNthCalledWith(
      1,
      "/path/to/extension/resources/git-hooks/pre-push-sample.sh"
    );
    expect(chmodSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push",
      0o777
    );
    expect(writeStringFileSpy).toHaveBeenNthCalledWith(
      1,
      "/root/user/repo/.git/hooks/pre-push",
      '#!/bin/sh\n\n# COVERING_SCRIPT_START\n\necho "Extension verification"\n\n# COVERING_SCRIPT_END'
    );
    expect(deleteFileSpy).not.toHaveBeenCalled();

    expect(mockChildProcess.exec).nthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree ",
      { cwd: "tests/mocks/workspace" },
      firstCallbackParam
    );
    expect(mockChildProcess.exec).lastCalledWith(
      "git rev-parse --absolute-git-dir ",
      { cwd: "tests/mocks/workspace" },
      secondCallbackParam
    );
  });

  it("should enablePreCommitHook when is not a git repo", async () => {
    let callbackParam!: ExecCallback;
    mockChildProcess.exec.mockImplementationOnce(
      (cmd, opt, callback: ExecCallback) => {
        callbackParam = callback;
        callback(null, "false\n", "");
      }
    );

    const existsSpy = jest.spyOn(fileSystemHelper, "exists");

    const readFileSpy = jest.spyOn(fileSystemHelper, "readFile");

    const deleteFileSpy = jest.spyOn(fileSystemHelper, "deleteFile");

    const chmodSpy = jest.spyOn(fileSystemHelper, "chmod");

    const writeStringFileSpy = jest.spyOn(fileSystemHelper, "writeStringFile");

    await gitService.enablePreCommitHook();

    expect(existsSpy).not.toHaveBeenCalled();
    expect(readFileSpy).not.toHaveBeenCalled();
    expect(deleteFileSpy).not.toHaveBeenCalled();
    expect(chmodSpy).not.toHaveBeenCalled();
    expect(writeStringFileSpy).not.toHaveBeenCalled();

    expect(mockChildProcess.exec).nthCalledWith(
      1,
      "git rev-parse --is-inside-work-tree ",
      { cwd: "tests/mocks/workspace" },
      callbackParam
    );
  });
});
