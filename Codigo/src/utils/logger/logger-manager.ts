import { injectable } from "inversify";
import { Logger } from "./logger";

@injectable()
export class LoggerManager {
  private readonly loggers = new Map<string, Logger>();

  public getServiceOutput<T>(service: T & Function): Logger {
    const logger = this.loggers.get(service.name);

    if (!logger) {
      const newOutputChannel = new Logger(service);

      this.loggers.set(service.name, newOutputChannel);
      return newOutputChannel;
    }

    return logger;
  }
}
