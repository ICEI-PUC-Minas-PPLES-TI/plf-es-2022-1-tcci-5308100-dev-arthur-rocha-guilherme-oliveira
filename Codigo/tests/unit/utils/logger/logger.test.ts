import * as date from "../../../mocks/date";
import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import { Logger } from "../../../../src/utils/logger/logger";

const outputChannel = vscode.mocks.outputChannel;
const window = vscode.window;

describe("Logger", () => {
  const LOGGER_NAME = "LOGGER TEST";
  let logger: Logger;
  beforeEach(() => {
    logger = new Logger(LOGGER_NAME);
  });

  afterEach(() => {
    logger.dispose();
  });

  it("Should create and dispose an output channel", () => {
    // Run
    logger.dispose();

    // Assert
    expect(vscode.window.createOutputChannel).toHaveBeenNthCalledWith(
      1,
      `[Covering] [${LOGGER_NAME}]`
    );
    expect(outputChannel.dispose).toBeCalledTimes(1);
  });

  it("Should log a info message to the Output Channel without toast notification", () => {
    // Run
    logger.info("Test");

    // Assert
    expect(outputChannel.appendLine).toHaveBeenNthCalledWith(
      1,
      "[INFO] - 2022-10-29T21:40:00.000Z Test"
    );
    expect(window.showInformationMessage).not.toHaveBeenCalled();
    expect(window.showErrorMessage).not.toHaveBeenCalled();
    expect(window.showWarningMessage).not.toHaveBeenCalled();
  });

  it("Should log a warning message to the Output Channel without toast notification", () => {
    date.setCurrentTime(Date.parse("2022-10-29T21:50:00.300Z") / 1000);

    // Run
    logger.warn("Warn test");

    // Assert
    expect(outputChannel.appendLine).toHaveBeenNthCalledWith(
      1,
      "[WARNING] - 2022-10-29T21:50:00.300Z Warn test"
    );
    expect(window.showInformationMessage).not.toHaveBeenCalled();
    expect(window.showErrorMessage).not.toHaveBeenCalled();
    expect(window.showWarningMessage).not.toHaveBeenCalled();
  });

  it("Should log a error message to the Output Channel without toast notification", () => {
    // Run
    logger.error("Error Test");

    // Assert
    expect(outputChannel.appendLine).toHaveBeenNthCalledWith(
      1,
      "[ERROR] - 2022-10-29T21:40:00.000Z Error Test"
    );
    expect(window.showInformationMessage).not.toHaveBeenCalled();
    expect(window.showErrorMessage).not.toHaveBeenCalled();
    expect(window.showWarningMessage).not.toHaveBeenCalled();
  });

  it("Should log a success message to the Output Channel without toast notification", () => {
    // Run
    logger.success("Success Test");

    // Assert
    expect(outputChannel.appendLine).toHaveBeenNthCalledWith(
      1,
      "[SUCCESS] - 2022-10-29T21:40:00.000Z Success Test"
    );
    expect(window.showInformationMessage).not.toHaveBeenCalled();
    expect(window.showErrorMessage).not.toHaveBeenCalled();
    expect(window.showWarningMessage).not.toHaveBeenCalled();
  });

  it("Should log a info message to the Output Channel with toast notification", () => {
    // Run
    logger.info("Test", true);

    // Assert
    expect(outputChannel.appendLine).toHaveBeenNthCalledWith(
      1,
      "[INFO] - 2022-10-29T21:40:00.000Z Test"
    );
    expect(window.showInformationMessage).toHaveBeenNthCalledWith(1, "Test");
  });

  it("Should log a warning message to the Output Channel with toast notification", () => {
    date.setCurrentTime(Date.parse("2022-10-29T21:50:00.300Z") / 1000);

    // Run
    logger.warn("Warn test", true);

    // Assert
    expect(outputChannel.appendLine).toHaveBeenNthCalledWith(
      1,
      "[WARNING] - 2022-10-29T21:50:00.300Z Warn test"
    );
    expect(window.showWarningMessage).toHaveBeenNthCalledWith(1, "Warn test");
  });

  it("Should log a error message to the Output Channel with toast notification", () => {
    // Run
    logger.error("Error Test", true);

    // Assert
    expect(outputChannel.appendLine).toHaveBeenNthCalledWith(
      1,
      "[ERROR] - 2022-10-29T21:40:00.000Z Error Test"
    );
    expect(window.showErrorMessage).toHaveBeenNthCalledWith(1, "Error Test");
  });

  it("Should log a success message to the Output Channel with toast notification", () => {
    // Run
    logger.success("Success Test", true);

    // Assert
    expect(outputChannel.appendLine).toHaveBeenNthCalledWith(
      1,
      "[SUCCESS] - 2022-10-29T21:40:00.000Z Success Test"
    );
    expect(window.showInformationMessage).toHaveBeenNthCalledWith(
      1,
      "Success Test"
    );
  });
});
