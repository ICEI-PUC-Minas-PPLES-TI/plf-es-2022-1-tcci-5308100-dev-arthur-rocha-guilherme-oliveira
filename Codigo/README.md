# Covering

This repository is distributing the code by domain packages, following the project document distribution. To get this document access: [`Documentacao Do Projeto.pdf`](https://github.com/ICEI-PUC-Minas-PPLES-TI/plf-es-2022-1-tcci-5308100-dev-arthur-rocha-guilherme-oliveira/blob/master/Documentacao/Documentacao%20Do%20Projeto.pdf)

## Functionalities

After install the extension you'll can see a new menu item in activity bar with label `Covering`. The extension will watch the workspace looking for a file called `lcov.info`. Every event with this file will be used to rerender the new test coverage status on vs code.

To use the extension, run you test script and generate de `lcov.info` file and you will able to see the coverage status for each line in editor, the actual covered lines percentage and a file tree view with all uncovered lines of your project. To se just what you've changed, click in the option in extendion configuration view: `Avaliar com base na branch: <BRANCH_NAME>`. You just will see this option if you workspace is in a git repo.

## Setting your own project configuration

You can set your own configuration crating a file called `.coveringconfig` in the root of your workspace. In this file you can declare an json with the following fields:

```json
{
  "minCoverage": 0.9,
  "refBranch": "master",
  "usePrePushValidation": true
}
```

After change this file, the repository will automatically refresh the values of your coverage status base on your last generated `lcov.info` file.
