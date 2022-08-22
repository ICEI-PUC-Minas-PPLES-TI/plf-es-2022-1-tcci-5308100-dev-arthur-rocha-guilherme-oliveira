import "reflect-metadata";
import { ExtensionContext } from "vscode";
import { DefaultConfiguration } from "./config";
import { appInjector } from "./inversify.config";
import { ExtensionOrchestrationService } from "./ui/core/extension-orchestration-service";

export function activate(context: ExtensionContext) {
  appInjector
    .bind<ExtensionContext>("ExtensionContext")
    .toConstantValue(context);

  const app = new ExtensionOrchestrationService();
  app.initApp();
}

export function deactivate() {}

