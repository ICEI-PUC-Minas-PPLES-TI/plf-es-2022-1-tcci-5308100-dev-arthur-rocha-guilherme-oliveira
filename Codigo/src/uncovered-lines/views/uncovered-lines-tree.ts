import { appInjector } from "../../inversify.config";
import {
  Event,
  EventEmitter,
  ExtensionContext,
  FileType,
  ThemeIcon,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  Uri,
  window,
} from "vscode";
import { LoggerManager } from "../../utils/logger/logger-manager";
import { UncoveredLinesService } from "../core/uncovered-lines-service";
import { File } from "../models/file";
import { Folder } from "../models/folder";
import { Line } from "../models/line";
import { UncoveredLinesData } from "../models/uncovered-lines-data";

type UncoveredLineTreeNode<T extends Folder | File | Line | undefined> = {
  type: FileType;
  selfData: T;
};

export class UncoveredLinesTree
  implements
    TreeDataProvider<UncoveredLineTreeNode<Folder | File | Line | undefined>>
{
  private logger = appInjector
    .get(LoggerManager)
    .getServiceOutput("UncoveredLinesTree");

  private uncoveredLinesService = appInjector.get(UncoveredLinesService);
  private context = appInjector.get<ExtensionContext>("ExtensionContext");

  private changeEvent = new EventEmitter<void>();
  private actualUncoveredLinesData!: UncoveredLinesData;

  constructor() {
    this.uncoveredLinesService
      .getUncoveredLinesData()
      .subscribe((newUncoveredLinesData) => {
        this.emitNewUncoveredLinesData(newUncoveredLinesData);
      });
  }

  static createView(): void {
    const uncoveredLinesTreeDataProvider = new UncoveredLinesTree();
    window.createTreeView("covering.uncovered-lines-view", {
      treeDataProvider: uncoveredLinesTreeDataProvider,
    });
  }

  private emitNewUncoveredLinesData(newUncoveredLinesData: UncoveredLinesData) {
    this.actualUncoveredLinesData = newUncoveredLinesData;
    this.changeEvent.fire();
    this.logger.info("Uncovered lines data changed");
  }

  public get onDidChangeTreeData(): Event<void> {
    return this.changeEvent.event;
  }

  public getTreeItem(
    element: UncoveredLineTreeNode<Folder | File | Line | undefined>
  ): TreeItem {
    const { selfData } = element;

    if (selfData instanceof Line) {
      const lineTreeItem = new TreeItem(
        `${selfData.parentFile.fileName}:${selfData.rangeLine.lineNumber}`,
        TreeItemCollapsibleState.None
      );
      return this.getLineTreeItem(lineTreeItem, selfData);
    }

    if (selfData instanceof File) {
      return this.getFileTreeItem(selfData);
    }

    if (selfData instanceof Folder) {
      return this.getFolderTreeItem(selfData);
    }

    return new TreeItem(
      this.actualUncoveredLinesData.root.hasSomethingToCover
        ? "Todas as linhas estão cobertas"
        : "Nenhuma linha para cobrir",
      TreeItemCollapsibleState.None
    );
  }

  public getChildren(
    element?: UncoveredLineTreeNode<Folder | File | Line>
  ): UncoveredLineTreeNode<Folder | File | Line | undefined>[] {
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

    if (this.actualUncoveredLinesData.root) {
      const rootChildren = this.getFolderChildren(
        this.actualUncoveredLinesData.root
      );

      if (rootChildren.length > 0) {
        return rootChildren;
      }

      return [
        {
          selfData: undefined,
          type: FileType.Unknown,
        },
      ];
    }

    return [];
  }

  private getLineTreeItem(lineTreeItem: TreeItem, selfData: Line): TreeItem {
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
    const folderTree = new TreeItem(
      selfData.folderName,
      TreeItemCollapsibleState.Expanded
    );
    folderTree.resourceUri = selfData.uri;
    return folderTree;
  }

  private getFileTreeItem(selfData: File) {
    const fileTreeItem = new TreeItem(
      selfData.fileName,
      TreeItemCollapsibleState.Collapsed
    );
    fileTreeItem.contextValue = "file";
    fileTreeItem.resourceUri = selfData.uri;
    fileTreeItem.iconPath = ThemeIcon.File;
    return fileTreeItem;
  }

  private getFileChildren(parentFile: File): UncoveredLineTreeNode<Line>[] {
    return parentFile.lines.map<UncoveredLineTreeNode<Line>>((line) => ({
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

      return a instanceof File ? 1 : -1;
    });

    return children.map<UncoveredLineTreeNode<Folder | File>>((item) => ({
      uri: item.uri,
      selfData: item,
      type: item instanceof Folder ? FileType.Directory : FileType.File,
    }));
  }
}
