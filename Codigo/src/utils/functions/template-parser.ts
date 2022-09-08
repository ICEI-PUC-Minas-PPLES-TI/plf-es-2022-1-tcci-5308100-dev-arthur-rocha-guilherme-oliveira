import { Uri, Webview } from "vscode";
import * as fs from "fs";

interface TemplateData {
  title: string;
  styles: Uri[];
  scripts: Uri[];
  data: any;
}

interface GlobalTemplateData {
  globalTemplateData: string;
}

function parseTemplate(
  templateBody: string,
  { globalTemplateData }: GlobalTemplateData,
  templateData: TemplateData
): string {
  const templateWithoutComments = removeComments(templateBody);

  const getTemplateParamsRegex = (): RegExp => /\${([^}]+)}/g;
  const nonce = getNonce();

  const completeTemplate = globalTemplateData.replace(
    getTemplateParamsRegex(),
    (_, key) => {
      if (key === "styles") {
        return templateData.styles
          .map((style: Uri) => `<link rel="stylesheet" href="${style}" />`)
          .join("");
      }

      if (key === "scripts") {
        return templateData.scripts
          .map(
            (script: Uri) =>
              `<script nonce="${nonce}" src="${script}"></script>`
          )
          .join("");
      }

      if (key === "title") {
        return templateData.title;
      }

      if (key === "body") {
        return templateWithoutComments;
      }

      if (key === "nonce") {
        return nonce;
      }

      return _;
    }
  );

  const templateReady = completeTemplate.replace(
    getTemplateParamsRegex(),
    (_, key) => {
      const data = templateData.data[key];
      return String(data);
    }
  );

  return templateReady;
}

function removeComments(template: string) {
  return template.replace(/(?=<!--)([\s\S]*?)-->/g, "");
}

export function getTemplate(
  webview: Webview,
  extensionUri: Uri,
  templateFileName: fs.PathOrFileDescriptor,
  templateData: TemplateData
) {
  const template = fs.readFileSync(templateFileName, "utf8");
  const globalData = getGlobalTemplateData(webview, extensionUri);
  return parseTemplate(template, globalData, templateData);
}

function getGlobalTemplateData(
  webview: Webview,
  extensionUri: Uri
): GlobalTemplateData {
  const styleResetUri = webview.asWebviewUri(
    Uri.joinPath(extensionUri, "src", "global", "reset.css")
  );
  const styleVSCodeUri = webview.asWebviewUri(
    Uri.joinPath(extensionUri, "src", "global", "vscode.css")
  );
  const globalTemplateUri = webview.asWebviewUri(
    Uri.joinPath(extensionUri, "src", "global", "webview-view-template.html")
  );
  const rawGlobalTemplate = fs.readFileSync(globalTemplateUri.fsPath, "utf8");
  const globalTemplateWithoutComments = removeComments(rawGlobalTemplate);

  const data = { styleResetUri, styleVSCodeUri };

  const globalTemplateData = globalTemplateWithoutComments.replace(
    /\${([^}]+)}/g,
    (_, key) => {
      if (key === "styleResetUri") {
        return data.styleResetUri.toString();
      }

      if (key === "styleVSCodeUri") {
        return data.styleVSCodeUri.toString();
      }

      if (key === "webview.cspSource") {
        return webview.cspSource;
      }

      return _;
    }
  );
  return { globalTemplateData };
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

