import { OutputChannel, window } from "vscode";

enum MessageType {
  INFO = "INFO",
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
}
export class Logger {
  private readonly outputChannel: OutputChannel;

  constructor(service: Function) {
    this.outputChannel = window.createOutputChannel(
      `[Covering] [${service.name}]`
    );
  }

  public info(message: string): void {
    this.sendMessage(MessageType.INFO, message);
  }

  public warn(message: string): void {
    this.sendMessage(MessageType.WARNING, message);
  }

  public error(message: string): void {
    this.sendMessage(MessageType.ERROR, message);
  }

  public success(message: string): void {
    this.sendMessage(MessageType.SUCCESS, message);
  }

  private sendMessage(messageType: MessageType, message: string) {
    const formatMessage = this.formatMessage(messageType, message);
    this.outputChannel.appendLine(formatMessage);
  }

  private formatMessage(messageType: MessageType, message: string): string {
    const now = new Date();
    return `[${messageType}] - ${now.toISOString()} ${message}`;
  }
}
