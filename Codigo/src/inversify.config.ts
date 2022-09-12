import "reflect-metadata";
import { Container } from "inversify";
import { CoverageService } from "./coverage/core/coverage-service";
import { FileCoverageService } from "./file-coverage/core/file-coverage-service";
import { LcovFileFinder } from "./visual-studio-code/lcov-file-finder";
import { VisualStudioCode } from "./visual-studio-code/visual-studio-code";
import { DefaultConfiguration } from "./config";
import { ExtensionConfigurationService } from "./extension-configuration/core/extension-configuration-service";
import { GitService } from "./version-control/core/git-service";
import { ProjectConfigurationService } from "./project-configuration/core/project-configuration-service";
import { UncoveredLinesService } from "./uncovered-lines/core/uncovered-lines-service";

const appInjector = new Container();

appInjector
  .bind<CoverageService>(CoverageService)
  .to(CoverageService)
  .inSingletonScope();

appInjector
  .bind<ExtensionConfigurationService>(ExtensionConfigurationService)
  .to(ExtensionConfigurationService)
  .inSingletonScope();

appInjector
  .bind<FileCoverageService>(FileCoverageService)
  .to(FileCoverageService)
  .inSingletonScope();

appInjector
  .bind<ProjectConfigurationService>(ProjectConfigurationService)
  .to(ProjectConfigurationService)
  .inSingletonScope();

appInjector
  .bind<LcovFileFinder>(LcovFileFinder)
  .to(LcovFileFinder)
  .inSingletonScope();

appInjector
  .bind<VisualStudioCode>(VisualStudioCode)
  .to(VisualStudioCode)
  .inSingletonScope();

appInjector
  .bind<DefaultConfiguration>(DefaultConfiguration)
  .to(DefaultConfiguration)
  .inSingletonScope();

appInjector.bind<GitService>(GitService).to(GitService).inSingletonScope();

appInjector
  .bind<UncoveredLinesService>(UncoveredLinesService)
  .to(UncoveredLinesService)
  .inSingletonScope();

export { appInjector };
