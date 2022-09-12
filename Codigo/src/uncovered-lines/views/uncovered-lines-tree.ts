import {
  Event,
  EventEmitter,
  ExtensionContext,
  FileType,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  Uri,
  window,
} from "vscode";
import { appInjector } from "../../inversify.config";
import { UncoveredLinesService } from "../core/uncovered-lines-service";
import { File } from "../models/file";
import { Folder } from "../models/folder";
import { Line } from "../models/line";

type UncoveredLineTreeNode<T extends Folder | File | Line> = {
  type: FileType;
  selfData: T;
};

export class UncoveredLinesTree
  implements TreeDataProvider<UncoveredLineTreeNode<Folder | File | Line>>
{
  static createView() {
    const uncoveredLinesTreeDataProvider = new UncoveredLinesTree();
    window.createTreeView("covering.uncovered-lines-view", {
      treeDataProvider: uncoveredLinesTreeDataProvider,
    });
  }

  private uncoveredLinesService = appInjector.get(UncoveredLinesService);
  private context = appInjector.get<ExtensionContext>("ExtensionContext");

  private changeEvent = new EventEmitter<void>();
  private actualRoot!: Folder;

  constructor() {
    this.uncoveredLinesService
      .getUncoveredLinesData()
      .subscribe((newUncoveredLinesData) => {
        this.actualRoot = newUncoveredLinesData.root;
        this.changeEvent.fire();
      });
  }

  public get onDidChangeTreeData(): Event<void> {
    return this.changeEvent.event;
  }

  public getTreeItem(
    element: UncoveredLineTreeNode<Folder | File | Line>
  ): TreeItem {
    const { selfData } = element;

    if (selfData instanceof Line) {
      const lineTreeItem = new TreeItem(
        `${selfData.parentFile.fileName}:${selfData.rangeLine.lineNumber}`,
        TreeItemCollapsibleState.None
      );
      return this.getLineTreeItem(lineTreeItem, selfData);
    }

    if (selfData instanceof Folder) {
      return this.getFolderTreeItem(selfData);
    }

    return this.getFileTreeItem(selfData);
  }

  private getLineTreeItem(lineTreeItem: TreeItem, selfData: Line) {
    lineTreeItem.command = {
      command: "covering.open-file",
      title: "Redirect to uncovered line",
      arguments: [selfData],
    };
    lineTreeItem.contextValue = "file";
    lineTreeItem.iconPath = Uri.joinPath(
      this.context.extensionUri,
      "resources",
      "uncovered-line-icons",
      `${selfData.coverageStatus}.svg`
    );
    return lineTreeItem;
  }

  private getFolderTreeItem(selfData: Folder): TreeItem {
    return new TreeItem(
      selfData.folderName,
      TreeItemCollapsibleState.Collapsed
    );
  }

  private getFileTreeItem(selfData: File) {
    const fileTreeItem = new TreeItem(
      selfData.fileName,
      TreeItemCollapsibleState.Collapsed
    );
    fileTreeItem.contextValue = "file";
    // fileTreeItem.resourceUri = selfData.uri;
    return fileTreeItem;
  }

  public getChildren(
    element?: UncoveredLineTreeNode<Folder | File | Line>
  ): UncoveredLineTreeNode<Folder | File | Line>[] {
    if (element) {
      const { selfData } = element;

      if (!selfData || selfData instanceof Line) {
        return [];
      }

      if (selfData instanceof File) {
        return this.getFileChildren(selfData);
      }

      if (selfData instanceof Folder) {
        return this.getFolderChildren(selfData);
      }

      return [];
    }

    if (this.actualRoot) {
      return this.getFolderChildren(this.actualRoot);
    }

    return [];
  }

  private getFileChildren(parentFile: File): UncoveredLineTreeNode<Line>[] {
    return parentFile.lines
      .sort((a, b) => a.rangeLine.lineNumber - b.rangeLine.lineNumber)
      .map<UncoveredLineTreeNode<Line>>((line) => ({
        type: FileType.Unknown,
        selfData: line,
      }));
  }

  private getFolderChildren(
    parentFolder: Folder
  ): UncoveredLineTreeNode<Folder | File>[] {
    const children = [...parentFolder.folders, ...parentFolder.files];

    children.sort((a, b) => {
      if (a instanceof Folder && b instanceof Folder) {
        return a.folderName.localeCompare(b.folderName);
      }

      if (a instanceof File && b instanceof File) {
        return a.fileName.localeCompare(b.fileName);
      }

      return a instanceof File ? -1 : 1;
    });

    return children.map<UncoveredLineTreeNode<Folder | File>>((item) => ({
      uri: item.uri,
      selfData: item,
      type: item instanceof Folder ? FileType.Directory : FileType.File,
    }));
  }
}
