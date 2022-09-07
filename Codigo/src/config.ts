import { injectable } from "inversify";
import {
  DecorationRenderOptions,
  ExtensionContext,
  OverviewRulerLane,
  TextEditorDecorationType,
  window,
} from "vscode";
import { appInjector } from "./inversify.config";

interface DecorationConfig {
  readonly noCoverageDecorationType: TextEditorDecorationType;
  readonly partialCoverageDecorationType: TextEditorDecorationType;
  readonly fullCoverageDecorationType: TextEditorDecorationType;
}

//TO-DO: Add to UML project - verify if is on correct class. Other option: ExtensionConfiguration
@injectable()
export class DefaultConfiguration {
  private context = appInjector.get<ExtensionContext>("ExtensionContext");

  public readonly textDecorationConfig: DecorationConfig;

  constructor() {
    this.textDecorationConfig =
      DefaultConfiguration.getInitialTextDecorationConfig(this.context);
  }

  private static getInitialTextDecorationConfig(
    context: ExtensionContext
  ): DecorationConfig {
    interface IDefaultIcons {
      gutterIconPathDark: string;
      gutterIconPathLight: string;
      noGutterIconPathDark: string;
      noGutterIconPathLight: string;
      partialGutterIconPathDark: string;
      partialGutterIconPathLight: string;
    }
    const defaultIcons: IDefaultIcons = {
      gutterIconPathDark: "./resources/gutter-icons/gutter-icon-dark.svg",
      gutterIconPathLight: "./resources/gutter-icons/gutter-icon-light.svg",
      noGutterIconPathDark: "./resources/gutter-icons/no-gutter-icon-dark.svg",
      noGutterIconPathLight:
        "./resources/gutter-icons/no-gutter-icon-light.svg",
      partialGutterIconPathDark:
        "./resources/gutter-icons/partial-gutter-icon-dark.svg",
      partialGutterIconPathLight:
        "./resources/gutter-icons/partial-gutter-icon-light.svg",
    };

    const getIcon = (name: keyof IDefaultIcons): string =>
      context.asAbsolutePath(defaultIcons[name]);

    const fullDecoration: DecorationRenderOptions = {
      dark: {
        backgroundColor: "rgba(141, 193, 73, 0.05)",
        gutterIconPath: getIcon("gutterIconPathDark"),
        overviewRulerColor: "rgba(141, 193, 73, 0.05)",
      },
      isWholeLine: true,
      light: {
        backgroundColor: "rgba(141, 193, 73, 0.05)",
        gutterIconPath: getIcon("gutterIconPathLight"),
        overviewRulerColor: "rgba(141, 193, 73, 0.05)",
      },
      overviewRulerLane: OverviewRulerLane.Full,
    };
    const partialDecoration: DecorationRenderOptions = {
      dark: {
        backgroundColor: "rgba(203, 203, 65, 0.05)",
        gutterIconPath: getIcon("partialGutterIconPathDark"),
        overviewRulerColor: "rgba(203, 203, 65, 0.05)",
      },
      isWholeLine: true,
      light: {
        backgroundColor: "rgba(203, 203, 65, 0.05)",
        gutterIconPath: getIcon("partialGutterIconPathLight"),
        overviewRulerColor: "rgba(203, 203, 65, 0.05)",
      },
      overviewRulerLane: OverviewRulerLane.Full,
    };

    const noDecoration: DecorationRenderOptions = {
      dark: {
        backgroundColor: "rgba(204, 62, 68, 0.05)",
        gutterIconPath: getIcon("noGutterIconPathDark"),
        overviewRulerColor: "rgba(204, 62, 68, 0.05)",
      },
      isWholeLine: true,
      light: {
        backgroundColor: "rgba(204, 62, 68, 0.05)",
        gutterIconPath: getIcon("noGutterIconPathLight"),
        overviewRulerColor: "rgba(204, 62, 68, 0.05)",
      },
      overviewRulerLane: OverviewRulerLane.Full,
    };

    const noCoverageDecorationType =
      window.createTextEditorDecorationType(noDecoration);
    const partialCoverageDecorationType =
      window.createTextEditorDecorationType(partialDecoration);
    const fullCoverageDecorationType =
      window.createTextEditorDecorationType(fullDecoration);

    return {
      noCoverageDecorationType,
      partialCoverageDecorationType,
      fullCoverageDecorationType,
    };
  }
}
