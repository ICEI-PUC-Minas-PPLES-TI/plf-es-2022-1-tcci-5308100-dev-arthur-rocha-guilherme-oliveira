// import * as date from "../../../mocks/date";
import * as vscode from "../../../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import { ExtensionOrchestrationService } from "../../../../src/ui/core/extension-orchestration-service";
import "../../../mocks/inversify";

// const extensionContext = vscode.mocks.extensionContext;
describe("Extension", () => {
  let extensionOrchestrationService: ExtensionOrchestrationService;

  beforeEach(() => {
    extensionOrchestrationService = new ExtensionOrchestrationService();
  });

  fit("should initiate app", () => {
    expect(extensionOrchestrationService.initApp).toBeDefined();

    extensionOrchestrationService.initApp();

    expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(3);
    //   const initAppSpy = jest
    //     .spyOn(ExtensionOrchestrationService.prototype, "initApp")
    //     .mockReturnValue();
    //   Extension.activate(extensionContext as any);
    //   expect(initAppSpy).toHaveBeenCalled();
  });
  // it("should activate2", () => {
  //   expect(Extension.activate).toBeDefined();
  //   const initAppSpy = jest
  //     .spyOn(ExtensionOrchestrationService.prototype, "initApp")
  //     .mockReturnValue();
  //   Extension.activate(extensionContext as any);
  //   expect(initAppSpy).toHaveBeenCalled();
  // });
  // it("should deactivate", () => {
  //   expect(Extension.deactivate).toBeDefined();
  //   const finishAppSpy = jest
  //     .spyOn(ExtensionOrchestrationService.prototype, "finishApp")
  //     .mockReturnValue();
  //   Extension.deactivate();
  //   expect(finishAppSpy).toHaveBeenCalled();
  // });
});
