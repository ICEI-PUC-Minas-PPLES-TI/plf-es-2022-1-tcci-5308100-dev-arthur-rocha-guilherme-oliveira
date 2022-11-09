// import * as date from "../../../mocks/date";
import * as vscode from "../mocks/vscode";
jest.mock("vscode", () => vscode, { virtual: true });

import * as Extension from "../../src/extension";
import { ExtensionOrchestrationService } from "../../src/ui/core/extension-orchestration-service";
import * as inversify from "../mocks/inversify";
import { Observable } from "rxjs";

const extensionContext = vscode.mocks.extensionContext;
describe("Extension", () => {
  beforeEach(() => {
    if (inversify.appInjector.isBound("ExtensionContext")) {
      inversify.appInjector.unbind("ExtensionContext");
    }
  });

  it("should activate", () => {
    expect(Extension.activate).toBeDefined();

    const initAppSpy = jest
      .spyOn(ExtensionOrchestrationService.prototype, "initApp")
      .mockReturnValue(new Observable());

    Extension.activate(extensionContext as any);

    expect(initAppSpy).toHaveBeenCalled();
  });

  it("should activate and deactivate", () => {
    expect(Extension.deactivate).toBeDefined();

    const initAppSpy = jest
      .spyOn(ExtensionOrchestrationService.prototype, "initApp")
      .mockReturnValue(new Observable());
    const finishAppSpy = jest
      .spyOn(ExtensionOrchestrationService.prototype, "finishApp")
      .mockReturnValue();

    Extension.activate(extensionContext as any);
    Extension.deactivate();

    expect(initAppSpy).toHaveBeenCalled();
    expect(finishAppSpy).toHaveBeenCalled();
  });
});
