import {
  EventEmitter,
  ProviderResult,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
} from "vscode";
import { File } from "../models/file";
import { Folder, getMockedFolder } from "../models/folder";
import { Line } from "../models/line";
import { UncoveredLinesData } from "../models/uncovered-lines-data";

type UncoveredLineTreeNode = Folder | File | Line;

export class UncoveredLinesTree
  implements TreeDataProvider<UncoveredLineTreeNode>
{
  private readonly _changeTreeData = new EventEmitter<
    UncoveredLineTreeNode | void | undefined | null
  >();

  public readonly onDidChangeTreeData = this._changeTreeData.event;
  private state: Folder = getMockedFolder();

  getTreeItem(element: UncoveredLineTreeNode): TreeItem | Thenable<TreeItem> {
    if (element instanceof Folder) {
      const label = element.path;
      const tree = new TreeItem(label, TreeItemCollapsibleState.Expanded);
      return tree;
    }

    if (element instanceof File) {
      const label = element.path;
      const tree = new TreeItem(label, TreeItemCollapsibleState.Expanded);
      return tree;
    }

    const label = `${element.parentFile.path}:${element.number}`;
    const tree = new TreeItem(label, TreeItemCollapsibleState.None);
    tree.iconPath = "resources/partial-covered-icon.svg";
    return tree;
  }

  getChildren(
    element?: UncoveredLineTreeNode | undefined
  ): ProviderResult<UncoveredLineTreeNode[]> {
    if (!element) {
      return [...this.state.folders, ...this.state.files];
    }

    if (element instanceof Folder) {
      return [...element.folders, ...element.files];
    }

    if (element instanceof File) {
      return element.lines;
    }

    return null;
  }

  public createView(): void {}

  public emitNewUncoveredLinesData(
    newUncoveredLinesData: UncoveredLinesData
  ): void {}

  public selectUncoveredLine(line: Line): void {}
}
