import { injectable } from "inversify";
import { Logger } from "./logger";

@injectable()
export class LoggerManager {
  private readonly loggers = new Map<string, Logger>();

  public getServiceOutput(serviceName: string): Logger {
    const logger = this.loggers.get(serviceName);

    if (!logger) {
      const newOutputChannel = new Logger(serviceName);

      this.loggers.set(serviceName, newOutputChannel);
      return newOutputChannel;
    }

    return logger;
  }
}
