import { injectable } from "inversify";
import { window } from "vscode";
import { Line } from "../models/line";
import { FileCoverage } from "../../file-coverage/models/file-coverage";
import { UncoveredLinesData } from "../models/uncovered-lines-data";
import { Observable, ReplaySubject } from "rxjs";
import { ConfigurationData } from "../../extension-configuration/models/configuration-data";

@injectable()
export class UncoveredLinesService {
  private uncoveredLinesDataSubject!: ReplaySubject<UncoveredLinesData>;

  public selectUncoveredLine(line: Line): void {
    window.showTextDocument(line.parentFile.uri, {
      selection: line.rangeLine,
    });
  }

  public getUncoveredLinesData(): Observable<UncoveredLinesData> {
    if (!this.uncoveredLinesDataSubject) {
      this.uncoveredLinesDataSubject = new ReplaySubject<UncoveredLinesData>();
    }

    return this.uncoveredLinesDataSubject.asObservable();
  }

  public async setCurrentUncoveredLines(
    fileCoverage: FileCoverage,
    extensionConfiguration: ConfigurationData
  ): Promise<void> {
    const newUncoveredLinesData =
      await UncoveredLinesData.updateUncoveredLinesData(
        fileCoverage,
        extensionConfiguration
      );
    if (newUncoveredLinesData) {
      this.uncoveredLinesDataSubject.next(newUncoveredLinesData);
    }
  }
}
