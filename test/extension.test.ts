//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
//import * as vscode from 'vscode';
import * as SysInfo from '../src/extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    // Defines a Mocha unit test
    test("sysinfo", () => {
        assert.equal(100.0, SysInfo.SysInfo.roundZoom(99.999));
        assert.equal(100.0, SysInfo.SysInfo.roundZoom(100.000));
        assert.equal(100.0, SysInfo.SysInfo.roundZoom(100.001));
        assert.equal(100.0, SysInfo.SysInfo.roundZoom(SysInfo.SysInfo.levelToPercent(0.0)));
        assert.equal(120.0, SysInfo.SysInfo.roundZoom(SysInfo.SysInfo.levelToPercent(1.0)));
        assert.equal(144.0, SysInfo.SysInfo.roundZoom(SysInfo.SysInfo.levelToPercent(2.0)));
        assert.equal(0.0, SysInfo.SysInfo.roundZoom(SysInfo.SysInfo.percentToLevel(100.0)));
        assert.equal(1.0, SysInfo.SysInfo.roundZoom(SysInfo.SysInfo.percentToLevel(120.0)));
        assert.equal(2.0, SysInfo.SysInfo.roundZoom(SysInfo.SysInfo.percentToLevel(144.0)));
        assert.equal("100%", SysInfo.SysInfo.percentToDisplayString(100.0, "ja-JP"));
        assert.equal("1,000%", SysInfo.SysInfo.percentToDisplayString(1000.0, "ja-JP"));
    });
});