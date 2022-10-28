import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';
import { ActivityBar } from "vscode-extension-tester";
import { expect } from "chai";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");
  let activityBar: ActivityBar;

  before(async () => {
    // init the activity bar page object
    activityBar = new ActivityBar();
  });

  // Test what view controls are available
  it("Shows explorer view control (container)", async () => {
    // get all the view controls
    const controls = await activityBar.getViewControls();
    expect(controls).not.empty;

    // get titles from the controls
    const titles = await Promise.all(
      controls.map(async (control) => {
        return control.getTitle();
      })
    );

    // assert a view control named 'Explorer' is present
    // the keyboard shortcut is part of the title, so we do a little transformation
    expect(titles.some((title) => title.startsWith("Explorer"))).is.true;
  });

  test("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
});
