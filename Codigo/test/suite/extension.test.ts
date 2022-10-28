import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';
import * as extest from "vscode-extension-tester";
import * as chai from "chai";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Shows explorer view control (container)", async (doneFn) => {
    const activityBar = new extest.ActivityBar();
    // get all the view controls
    const controls = await activityBar.getViewControls();
    chai.expect(controls).not.empty;

    // get titles from the controls
    const titles = await Promise.all(
      controls.map(async (control) => {
        return control.getTitle();
      })
    );

    // assert a view control named 'Explorer' is present
    // the keyboard shortcut is part of the title, so we do a little transformation
    chai.expect(titles.some((title) => title.startsWith("Explorer"))).is.true;

    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));

    doneFn();
  });
});
