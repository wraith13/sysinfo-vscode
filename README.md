# System Information README ( [🇯🇵 Japanese](https://github.com/wraith13/sysinfo-vscode/blob/master/README.ja.md) )

[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/version/wraith13.sysinfo-vscode.svg) ![installs](https://vsmarketplacebadge.apphb.com/installs/wraith13.sysinfo-vscode.svg) ![rating](https://vsmarketplacebadge.apphb.com/rating/wraith13.sysinfo-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=wraith13.sysinfo-vscode)

Show system information ( includes extensions list ) by markdown or JSON for vscode.

## Features

`System Information: Show` command shows Visual Studio Code system information ( includes extensions list ) by markdown or JSON.

![screen shot](./images/screenshot.png)

## Tutorial

### 0. ⬇️ Install System Information

Show extension side bar within VS Code(Mac:<kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd>, Windows and Linux: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd>), type `sysinfo-vscode` and press <kbd>Enter</kbd> and click <kbd>Install</kbd>. Restart VS Code when installation is completed.

### 1. ✨️ Show System Information

Launch Command Palette(Mac:<kbd>F1</kbd> or <kbd>Shift</kbd>+<kbd>Command</kbd>+<kbd>P</kbd>, Windows and Linux: <kbd>F1</kbd> or <kbd>Shift</kbd>+<kbd>Ctrl</kbd>+<kbd>P</kbd>), Execute `System Information: Show` command and select options as you like.

### 2. 🔧 Next step

You can change [settings](#extension-settings) by `settings.json`.

Enjoy!

## Commands

* `System Information: Show` : show system information

## Extension Settings

This extension contributes the following settings by [`settings.json`](https://code.visualstudio.com/docs/customization/userandworkspace#_creating-user-and-workspace-settings)( Mac: <kbd>Command</kbd>+<kbd>,</kbd>, Windows / Linux: <kbd>File</kbd> -> <kbd>Preferences</kbd> -> <kbd>User Settings</kbd> ):

* `sysinfo.hideItems`: set list of hide items

You can hide the specified items. see below example.

```json
"sysinfo.hideItems": [
    "timestamp",
    "provider",
    "warnings.W001",
    "vscode.env",
    "vscode.extensions.*.packageJSON.description"
]
```

## Release Notes

see ChangLog on [marketplace](https://marketplace.visualstudio.com/items/wraith13.sysinfo-vscode/changelog) or [github](https://github.com/wraith13/sysinfo-vscode/blob/master/CHANGELOG.md)

## Support

[GitHub Issues](https://github.com/wraith13/sysinfo-vscode/issues)

## License

[Boost Software License](https://github.com/wraith13/sysinfo-vscode/blob/master/LICENSE_1_0.txt)
