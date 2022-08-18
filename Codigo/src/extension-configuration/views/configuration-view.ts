import {
  EventEmitter,
  ProviderResult,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
} from "vscode";

class Node {
  constructor(public readonly label: string, public value: string) {}
}

export class ConfigurationView implements TreeDataProvider<Node> {
  private readonly _changeTreeData = new EventEmitter<
    Node | void | undefined | null
  >();

  public readonly onDidChangeTreeData = this._changeTreeData.event;

  getTreeItem(element: Node): TreeItem | Thenable<TreeItem> {
    const label = element.label;
    const tree = new TreeItem(label, TreeItemCollapsibleState.None);
    return tree;
  }

  getChildren(element?: Node | undefined): ProviderResult<Node[]> {
    return [new Node("Node 1", "1"), new Node("Node 2", "2")];
  }

  public static createView(): void {}

  public toggleLineStatusVisibility(): void {}

  public toggleCoveragePercentageMode(): void {}

  public toggleCoverageBaseReferenceMode(): void {}
}
