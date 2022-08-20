import "reflect-metadata";
import { ExtensionContext, window, commands } from "vscode";
import { ExtensionOrchestrationService } from "./ui/core/extension-orchestration-service";

export function activate(context: ExtensionContext) {
  const app = new ExtensionOrchestrationService(context);
  app.initApp();
}

export function deactivate() {}

