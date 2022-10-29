import { OutputChannel, window } from "vscode";

export enum MessageType {
  INFO = "INFO",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
}
export class Logger {
  private readonly outputChannel: OutputChannel;

  constructor(serviceName: string) {
    this.outputChannel = window.createOutputChannel(
      `[Covering] [${serviceName}]`
    );
  }

  public dispose() {
    this.outputChannel.dispose();
  }

  public info(message: string, showToast?: boolean): void {
    this.sendMessage(MessageType.INFO, message, showToast);
  }

  public warn(message: string, showToast?: boolean): void {
    this.sendMessage(MessageType.WARNING, message, showToast);
  }

  public error(message: string, showToast?: boolean): void {
    this.sendMessage(MessageType.ERROR, message, showToast);
  }

  public success(message: string, showToast?: boolean): void {
    this.sendMessage(MessageType.SUCCESS, message, showToast);
  }

  public sendMessage(
    messageType: MessageType,
    message: string,
    showToast = false
  ) {
    if (showToast) {
      this.showToast(messageType, message);
    }
    const formatMessage = this.formatMessage(messageType, message);
    this.outputChannel.appendLine(formatMessage);
  }

  private showToast(messageType: MessageType, message: string) {
    switch (messageType) {
      case MessageType.INFO:
        window.showInformationMessage(message);
        break;
      case MessageType.ERROR:
        window.showErrorMessage(message);
        break;
      case MessageType.SUCCESS:
        window.showInformationMessage(message);
        break;
      case MessageType.WARNING:
        window.showWarningMessage(message);
        break;
    }
  }

  private formatMessage(messageType: MessageType, message: string): string {
    const now = new Date();
    return `[${messageType}] - ${now.toISOString()} ${message}`;
  }
}
