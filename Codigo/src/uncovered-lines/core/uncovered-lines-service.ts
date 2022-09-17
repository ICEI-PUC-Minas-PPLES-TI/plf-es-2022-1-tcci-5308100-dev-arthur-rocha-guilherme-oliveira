import { injectable } from "inversify";
import { window } from "vscode";
import { Line } from "../models/line";
import { FileCoverage } from "../../file-coverage/models/file-coverage";
import { UncoveredLinesData } from "../models/uncovered-lines-data";
import { Observable, ReplaySubject } from "rxjs";
import { ConfigurationData } from "../../extension-configuration/models/configuration-data";
import { LoggerManager } from "../../utils/logger/logger-manager";
import { appInjector } from "../../inversify.config";

@injectable()
export class UncoveredLinesService {
  private logger = appInjector
    .get(LoggerManager)
    .getServiceOutput("UncoveredLinesService");

  private uncoveredLinesDataSubject!: ReplaySubject<UncoveredLinesData>;

  public selectUncoveredLine(line: Line): void {
    this.logger.info(
      `Selecting uncovered line: ${line.parentFile.uri.fsPath}:${line.rangeLine.lineNumber}`
    );
    window.showTextDocument(line.parentFile.uri, {
      selection: line.rangeLine,
    });
  }

  public getUncoveredLinesData(): Observable<UncoveredLinesData> {
    if (!this.uncoveredLinesDataSubject) {
      this.logger.info(
        "Creating new uncovered lines data subject for the first time"
      );
      this.uncoveredLinesDataSubject = new ReplaySubject<UncoveredLinesData>();
    } else {
      this.logger.info("Returning existing uncovered lines data subject");
    }

    return this.uncoveredLinesDataSubject.asObservable();
  }

  public async setCurrentUncoveredLines(
    fileCoverage: FileCoverage,
    extensionConfiguration: ConfigurationData
  ): Promise<void> {
    this.logger.info(
      "New uncovered lines data requested, updating uncovered lines data"
    );

    const newUncoveredLinesData =
      await UncoveredLinesData.updateUncoveredLinesData(
        fileCoverage,
        extensionConfiguration
      );

    if (newUncoveredLinesData) {
      this.logger.success(
        "New uncovered lines data generated, updating uncovered lines data subject"
      );
      this.uncoveredLinesDataSubject.next(newUncoveredLinesData);
      return;
    }

    this.logger.error(
      "Something went wrong while generating new uncovered lines data.\n" +
        `${{ extensionConfiguration, fileCoverage }}`
    );
  }
}
