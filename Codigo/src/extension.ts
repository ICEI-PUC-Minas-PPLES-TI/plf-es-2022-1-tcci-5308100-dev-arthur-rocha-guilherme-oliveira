import { appInjector } from "./inversify.config";
import "reflect-metadata";
import { ExtensionContext } from "vscode";
import { ExtensionOrchestrationService } from "./ui/core/extension-orchestration-service";

let app: ExtensionOrchestrationService;
export function activate(context: ExtensionContext) {
  appInjector
    .bind<ExtensionContext>("ExtensionContext")
    .toConstantValue(context);

  app = new ExtensionOrchestrationService();
  app.initApp();
}

export function deactivate() {
  app.finishApp();
}
