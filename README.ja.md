# システム情報 README

[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/version/wraith13.sysinfo-vscode.svg) ![installs](https://vsmarketplacebadge.apphb.com/installs/wraith13.sysinfo-vscode.svg) ![rating](https://vsmarketplacebadge.apphb.com/rating/wraith13.sysinfo-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=wraith13.sysinfo-vscode)

VS Code のシステム情報(拡張一覧を含む)を markdown あるいは JSON で表示します。

## 機能

`System Information: Show` コマンドで VS Code のシステム情報(拡張一覧を含む)を markdown あるいは JSON で表示します。

![screen shot](./images/screenshot.png)

## チュートリアル

### 0. ⬇️ システム情報拡張のインストール

VS Code の拡張サイドバーを出して(Mac:<kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd>, Windows and Linux: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd>)、 `sysinfo-vscode` とタイプし <kbd>Enter</kbd> キーを押下し、<kbd>インストール</kbd> をクリックします。インストールが終わったら VS Code を再起動してください。

### 1. ✨️ システム情報の表示

コマンドパレットを出して(Mac:<kbd>F1</kbd> or <kbd>Shift</kbd>+<kbd>Command</kbd>+<kbd>P</kbd>, Windows and Linux: <kbd>F1</kbd> or <kbd>Shift</kbd>+<kbd>Ctrl</kbd>+<kbd>P</kbd>)、 `System Information: Show` コマンドを実行し、あなたの好きなオプションを選択します。

### 2. 🔧 次のステップ

`settings.json` で システム情報 の[設定](#拡張の設定)を変更できます。

### コマンドリスト

* `System Information: Show` : システム情報を表示します

## 拡張の設定

[`settings.json`](https://code.visualstudio.com/docs/customization/userandworkspace#_creating-user-and-workspace-settings)( Mac: <kbd>Command</kbd>+<kbd>,</kbd>, Windows / Linux: <kbd>ファイル</kbd> → <kbd>基本設定</kbd> → <kbd>設定</kbd> ) で次の設定ができます。

* `sysinfo.hideItems`: 隠す項目の一覧を設定します

指定した項目を隠すことができます。下のサンプルを参照してください。

```json
"sysinfo.hideItems": [
    "timestamp",
    "provider",
    "warnings.W001",
    "vscode.env",
    "vscode.extensions.*.packageJSON.description"
]
```

## リリースノート

[marketplace](https://marketplace.visualstudio.com/items/wraith13.sysinfo-vscode/changelog) あるいは [github](https://github.com/wraith13/sysinfo-vscode/blob/master/CHANGELOG.md) の ChangLog を参照してください。

## サポート

[GitHub Issues](https://github.com/wraith13/sysinfo-vscode/issues)

## ライセンス

[Boost Software License](https://github.com/wraith13/sysinfo-vscode/blob/master/LICENSE_1_0.txt)
