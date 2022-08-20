import "reflect-metadata";
import { Container } from "inversify";
import { CoverageService } from "./coverage/core/coverage-service";
import { FileCoverageService } from "./file-coverage/core/file-coverage-service";

const appInjector = new Container();

appInjector
  .bind<CoverageService>(CoverageService)
  .to(CoverageService)
  .inSingletonScope();

appInjector
  .bind<FileCoverageService>(FileCoverageService)
  .to(FileCoverageService)
  .inSingletonScope();

export { appInjector };

