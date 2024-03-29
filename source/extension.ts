'use strict';
import * as vscode from 'vscode';
import * as os from 'os';
import * as vscel from '@wraith13/vscel';
import packageJson from "../package.json";
import localeEn from "../package.nls.json";
import localeJa from "../package.nls.ja.json";
const locale = vscel.locale.make(localeEn, { "ja": localeJa, });
export module SysInfo
{
    module Config
    {
        export const root = vscel.config.makeRoot(packageJson);
        export const enabledStatusBar = root.makeEntry<boolean>("sysinfo.enabledStatusBar", "root-workspace");
        export const hideItems = root.makeEntry<string[]>("sysinfo.hideItems", "root-workspace");
        export const statusBarLabel = root.makeEntry<string | []>("sysinfo.statusBarLabel", "root-workspace");
        export const statusBarSwitchInterval = root.makeEntry<number>("sysinfo.statusBarSwitchInterval", "root-workspace");
        export const statusBarCommand = root.makeEntry<string>("sysinfo.statusBarCommand", "root-workspace");
    }
    const copyCommandName = 'sysinfo-vscode.copyStatusBarText';
    const switchCommandName = 'sysinfo-vscode.switchStatusBarLabel';
    let statusBarItem: vscode.StatusBarItem;
    let statusBarText: string = "";
    let statusBarTextIndex: number = 0;
    let statusBarSwitchInterval: NodeJS.Timeout | undefined;
    const stringOrJoin = (text: string | string[], separator: string = " ") =>
        Array.isArray(text) ? text.join(separator): text;
    const stringOrAt = (text: string | string[], index: number) =>
        Array.isArray(text) ? text[index % text.length]: text;
    const practicalTypeof = (obj: any): string =>
    {
        if (undefined === obj)
        {
            return "undefined";
        }
        if (null === obj)
        {
            return "null";
        }
        if ("[object Array]" === Object.prototype.toString.call(obj))
        {
            return "array";
        }
        return typeof obj;
    };
    export const initialize = (context: vscode.ExtensionContext): void =>
    {
        context.subscriptions.push
        (
            //  コマンドの登録
            vscode.commands.registerCommand
            (
                'sysinfo-vscode.showSystemInformation', showSystemInformation
            ),
            vscode.commands.registerCommand
            (
                'sysinfo-vscode.showSchema', showSchema
            ),
            vscode.commands.registerCommand
            (
                copyCommandName, copyStatusBarText
            ),
            vscode.commands.registerCommand
            (
                switchCommandName, switchStatusBarLabel
            ),
            //  ステータスバーアイテムの登録
            statusBarItem = vscel.statusbar.createItem
            ({
                alignment: vscode.StatusBarAlignment.Right,
                command: 'sysinfo-vscode.showSystemInformation',
                tooltip: 'exec sysinfo-vscode.showSystemInformation'
            }),
            //  イベントリスナーの登録
            vscode.workspace.onDidChangeConfiguration
            (
                event =>
                {
                    const affectsConfiguration = event.affectsConfiguration("sysinfo");
                    if
                    (
                        affectsConfiguration ||
                        (
                            Config.enabledStatusBar.get() &&
                            hasSettingKey(stringOrJoin(Config.statusBarLabel.get()))
                        )
                    )
                    {
                        if (affectsConfiguration)
                        {
                            updateStatusBarSwitchInterval();
                        }
                        updateStatusBar();
                    }
                }
            ),
            vscode.window.onDidChangeActiveTextEditor
            (
                _event =>
                {
                    if
                    (
                        Config.enabledStatusBar.get() &&
                        hasSettingKey(stringOrJoin(Config.statusBarLabel.get()))
                    )
                    {
                        updateStatusBar();
                    }
                }
            ),
        );
        updateStatusBarSwitchInterval();
        updateStatusBar();
    };
    const lengthWithEscape = (text: string) => text.replace(/\$\([\w-]+\)/g,"@").length;
    const substrWithEscape = (text: string, index: number, length: number) => text.replace
        (
            /\$\([\w-]+\)/g,
            (match, offset) =>
            {
                if (offset < index)
                {
                    index += (match.length -1);
                }
                else
                if (offset < (index +length))
                {
                    length += (match.length -1);
                }
                return match;
            }
        )
        .substr(index, length);
    const clipWithEscape = (text: string, maxTextLength: number) => lengthWithEscape(text) <= maxTextLength ? text: substrWithEscape(text, 0, maxTextLength) +"...";
    const updateStatusBarSwitchInterval = () : void =>
    {
        statusBarTextIndex = 0;
        if (undefined !== statusBarSwitchInterval)
        {
            clearInterval(statusBarSwitchInterval);
            statusBarSwitchInterval = undefined;
        }
        const interval = Config.statusBarSwitchInterval.get();
        const statusBarLabel = Config.statusBarLabel.get();
        if (Array.isArray(statusBarLabel) && 1 < statusBarLabel.length && 100 <= interval)
        {
            statusBarSwitchInterval = setInterval
            (
                switchStatusBarLabel,
                interval
            );
        }
    }
    const updateStatusBar = () : void =>
    {
        if (Config.enabledStatusBar.get())
        {
            statusBarText = developInfomation
            (
                stringOrAt(Config.statusBarLabel.get(), statusBarTextIndex),
                getSystemInformation
                ({
                    categories: [ "basic", "cpu", "memory", "network" ],
                    withSensitiveData: true,
                    withInternalExtensions: false,
                })
            );
            statusBarItem.text = clipWithEscape(statusBarText, 48);
            statusBarItem.command = Config.statusBarCommand.get();
            statusBarItem.tooltip =
                copyCommandName === statusBarItem.command ? locale.map("Click to copy"):
                switchCommandName === statusBarItem.command ? locale.map("Click to switch"):
                `${locale.map("Click to execute")}: ${statusBarItem.command}`;
            statusBarItem.show();
        }
        else
        {
            statusBarItem.hide();
        }
    };
    const copyStatusBarText = () => vscode.env.clipboard.writeText(statusBarText);
    const switchStatusBarLabel = () =>
    {
        const statusBarLabel = Config.statusBarLabel.get();
        if (Array.isArray(statusBarLabel) && 1 < statusBarLabel.length)
        {
            statusBarTextIndex = (statusBarTextIndex +1) %statusBarLabel.length;
            updateStatusBar();
        }
    };
    const settingsKeyHeader = "settings:";
    const isSettingKey = (key: string) => key.startsWith(settingsKeyHeader);
    const hasSettingKey = (source: string) => source.includes(settingsKeyHeader);
    const getSettingValue = (key: string) => vscode.workspace.getConfiguration
    (
        undefined,
        vscode.window.activeTextEditor?.document ?? vscode.workspace.workspaceFolders?.[0]
    ).get(key.split(settingsKeyHeader)[1]);
    const getObjectValue = (object: any, key: string): any => key.split(".").reduce
    (
        (previous, current) =>
            ("object" === practicalTypeof(previous)) ?
                previous[current]:
                undefined,
        object
    );
    const getValue = (object: any, key: string): any =>
    {
        const value = isSettingKey(key) ?
            getSettingValue(key):
            getObjectValue(object, key);
        return 0 <= ["object", "array"].indexOf(practicalTypeof(value)) ? JSON.stringify(value): value;
    };
    const developInfomation = (source: string, information: any): string => source
        .replace
        (
            /\$\{([\w\.\:\-]+)\}/g,
            (_match, p1) => getValue(information, p1)
        );
    interface GetSystemInformationOptions
    {
        categories: string[];
        withSensitiveData: boolean;
        withInternalExtensions: boolean;
    }
    export const getSystemInformation = (options: GetSystemInformationOptions): object =>
    {
        const thisExtension = vscode.extensions.getExtension("wraith13.sysinfo-vscode");
        return {
            "timestamp": new Date().toISOString(),
            "provider":
            {
                "id": thisExtension && thisExtension.id,
                "name": thisExtension && thisExtension.packageJSON.name,
                "displayName": thisExtension && thisExtension.packageJSON.displayName,
                "version": thisExtension && thisExtension.packageJSON.version,
                "options": options,
            },
            "warning": undefined, // 表示位置をここにする為に undefined で事前挿入
            "os": 0 <= options.categories.indexOf("basic") ?
            {
                "arch": os.arch(),
                "platform": os.platform(),
                "type": os.type(),
                "release": os.release(),
                "EOL": JSON.stringify(os.EOL),
                "endianness": os.endianness(),
                "cpus": 0 <= options.categories.indexOf("cpu") ? os.cpus(): undefined,
                "totalmem": 0 <= options.categories.indexOf("memory") ? os.totalmem(): undefined,
                "freemem": 0 <= options.categories.indexOf("memory") ? os.freemem(): undefined,
                "networkInterfaces": 0 <= options.categories.indexOf("network") && options.withSensitiveData ? os.networkInterfaces(): undefined,
                "hostname": options.withSensitiveData ? os.hostname(): undefined,
                "homedir": options.withSensitiveData ? os.homedir(): undefined,
                "tmpdir": options.withSensitiveData ? os.tmpdir(): undefined,
            }: undefined,
            "process": 0 <= options.categories.indexOf("basic") ?
            {
                "versions": process.versions,
                "arch": process.arch,
                "execPath": options.withSensitiveData ? process.execPath: undefined,
                "execArgv": options.withSensitiveData ? process.execArgv: undefined,
                "env":
                {
                    "LANG": process.env.LANG,
                }
            }: undefined,
            "vscode":
            {
                "version": vscode.version,
                "env":
                {
                    "appName": vscode.env.appName,
                    "language": vscode.env.language
                },
                "extensions": 0 <= options.categories.indexOf("extensions") ? getExtentionsformation(options): undefined,
            },
        };
    };
    interface Extension
    {
        id: string;
    }
    const isInternalExtension = (extension: Extension): boolean => extension.id.startsWith("vscode.");
    export const getExtentionsformation = (options: GetSystemInformationOptions): object =>
    {
        return vscode.extensions.all
        .filter(extension => (options.withInternalExtensions || !isInternalExtension(extension)))
        .map
        (
            extension =>
            ({
                "id": extension.id,
                "isActive": extension.isActive,
                "extensionPath": options.withSensitiveData ? extension.extensionPath: undefined,
                "packageJSON":
                {
                    "name": extension.packageJSON.name,
                    "version": extension.packageJSON.version,
                    "displayName": extension.packageJSON.displayName,
                    "description": extension.packageJSON.description,
                    "publisher": extension.packageJSON.publisher,
                    "categories": extension.packageJSON.categories,
                }
            })
        );
    };
    export const systemLint = (information: any): any =>
    {
        if ("darwin" === information["os"]["platform"] && undefined === information["process"]["env"]["LANG"])
        {
            information["warnings"] = information["warnings"] || { };
            information["warnings"]["W001"] = locale.map("W001");
        }
        return information;
    };
    export const hideInformation = (information: any): any =>
    {
        Config.hideItems.get().forEach
        (
            path =>
            {
                var parents = [information];
                path.split(".").forEach
                (
                    (key, index, keys) =>
                    {
                        if (0 < parents.length)
                        {
                            if (index +1 < keys.length)
                            {
                                if ("*" === key)
                                {
                                    parents = parents
                                        .map
                                        (
                                            parent => Object.keys(parent)
                                                .map(i => parent[i])
                                                .filter(i => undefined !== i)
                                        )
                                        .reduce((a,b) => a.concat(b));
                                }
                                else
                                {
                                    parents = parents
                                        .map(parent => parent[key])
                                        .filter(parent => undefined !== parent);
                                }
                            }
                            else
                            {
                                parents.forEach(parent => delete parent[key]);
                            }
                        }
                    }
                );
            }
        );
        return information;
    };
    const openNewTextDocument = async (language: string): Promise<vscode.TextDocument> =>
        await vscode.workspace.openTextDocument({ language });
    const showQuickPick = async (
        items: vscode.QuickPickItem[],
        options: vscode.QuickPickOptions,
        autoSelectedIndex?: number
    ): Promise<vscode.QuickPickItem|undefined> => undefined === autoSelectedIndex ?
            await vscode.window.showQuickPick(items, options):
            items[autoSelectedIndex];
    const openNewCodeDocument = async (language: string, code: string): Promise<void> =>
    {
        const document = await openNewTextDocument(language);
        const textEditor = await vscode.window.showTextDocument(document);
        textEditor.edit
        (
            (editBuilder: vscode.TextEditorEdit) =>
            {
                editBuilder.insert(new vscode.Position(0,0), code);
            }
        );
    };
    export const showSystemInformation = async (): Promise<void> =>
    {
        const selectedCategories =  await showQuickPick
        (
            [
                {
                    "label": locale.map("BasicInfo.label"),
                    "description": "",
                    "detail": "basic, extensions"
                },
                {
                    "label": locale.map("FullInfo.label"),
                    "description": locale.map("FullInfo.description"),
                    "detail": "basic, cpu, memory, network, extensions"
                }
            ],
            {
                placeHolder: locale.map("selectCategories.placeHolder"),
            }
        );
        if ( ! selectedCategories)
        {
            return;
        }
        const categories = (selectedCategories.detail || "").split(",").map(i => i.trim());
        const isFull = selectedCategories.label === locale.map("FullInfo.label");
        const information = getSystemInformation
        (
            {
                categories: categories,
                withSensitiveData: isFull,
                withInternalExtensions: isFull,
            }
        );
        systemLint(information);
        hideInformation(information);
        await vscel.menu.showQuickPick
        (
            [
                {
                    "label": "Markdown",
                    "description": "",
                    "detail": "markdown"
                },
                {
                    "label": "JSON",
                    "description": "",
                    "detail": "json"
                }
            ],
            {
                placeHolder: locale.map("selectFormat.placeHolder"),
                command: async format => await openNewCodeDocument
                (
                    format.detail,
                    "json" === format.detail ?
                        JSON.stringify(information, null, 4):
                        informationToMarkdown(information)
                )
            }
        );
    };
    const escapeMarkdown = (text: string): string => text.replace(/\\/g, "\\\\");
    const makeMarkdownHeader =(level: number, title: string): string => `${"#".repeat(level)} ${escapeMarkdown(title)}\n`;
    const makeMarkdownTable = (data: [{key:string,value:any}]): string =>
    {
        return [
            "| key | value |",
            0 < data.filter(i => "number" !== practicalTypeof(i.value)).length ? "|---|---|": "|---|---:|",
        ]
        .concat
        (
            data.map
            (
                i =>
                    "string" === practicalTypeof(i.value) ? `| ${escapeMarkdown(i.key)} | ${escapeMarkdown(i.value)} |`:
                    "number" === practicalTypeof(i.value) ? `| ${escapeMarkdown(i.key)} | ${escapeMarkdown(i.value.toLocaleString())} |`:
                    `| ${escapeMarkdown(i.key)} | ${escapeMarkdown(JSON.stringify(i.value))} |`
            )
        )
        .join("\n") +"\n";
    };
    const makeMarkdown = (data: any, level: number = 2, title?: string, isExtensionData: boolean = false): string | undefined =>
    {
        if (!data)
        {
            return undefined;
        }
        const extensionLinks = (isExtensionData && data && data.id && !isInternalExtension(data)) ?
            [
                `- [${locale.map("link.marketplace.label")}](https://marketplace.visualstudio.com/items?itemName=${data.id})\n`,
                `- [${locale.map("link.vscode.label")}](vscode:extension/${data.id})\n`
            ]
            .join(""):
            undefined;
        const tableItems: [{key:string,value:any}] = <any>[];
        const arrayItems: [{key:string,value:[any]}] = <any>[];
        const subTables: [{key:string,value:any}] = <any>[];
        Object.keys(data)
            .filter(key => undefined !== data[key])
            .forEach
            (
                key =>
                {
                    const value = data[key];
                    const type = practicalTypeof(value);
                    if
                    (
                        ("object" !== type || 0 === Object.keys(value).filter(i => undefined !== value[i]).length) &&
                        ("array" !== type || 0 === value.length || "string" === practicalTypeof(value[0]))
                    )
                    {
                        tableItems.push({key: key, value: value});
                    }
                    else
                    if ("array" === type)
                    {
                        arrayItems.push({key: key, value: value});
                    }
                    else
                    {
                        subTables.push({key: key, value: value});
                    }
                }
            );
        if (isExtensionData && data && data.packageJSON)
        {
            subTables.pop();
            Object.keys(data.packageJSON)
                .filter(key => undefined !== data.packageJSON[key])
                .forEach
                (
                    key =>
                    {
                        if (undefined !== data.packageJSON[key])
                        {
                            tableItems.push({key: key, value: data.packageJSON[key]});
                        }
                    }
                );
        }
        return [
            title ? makeMarkdownHeader(level, title): undefined,
            extensionLinks,
            0 < tableItems.length ? makeMarkdownTable(tableItems): undefined,
        ]
        .concat(subTables.map(i => makeMarkdown(i.value, level + 1, i.key, isExtensionData)))
        .concat
        (
            arrayItems.map
            (
                i =>
                [
                    makeMarkdownHeader(level +1, i.key),
                    undefined
                ]
                .concat
                (
                    i.value.map
                    (
                        (j: any, index: number) => makeMarkdown
                        (
                            j,
                            level +2,
                            isExtensionData && j && j.packageJSON && j.packageJSON.displayName ? j.packageJSON.displayName:
                            isExtensionData && j && j.packageJSON && j.packageJSON.name ? j.packageJSON.name:
                                `${i.key}.${index}`,
                            isExtensionData
                        )
                    )
                )
                .filter(i => undefined !== i)
                .join("\n")
            )
        )
        .filter(i => undefined !== i)
        .join("\n");
    };
    export const informationToMarkdown = (information: any): string =>
    {
        return [
            makeMarkdownHeader(1, "VS Code System Information"),
            information["timestamp"] && `timestamp: ${information["timestamp"]}\n`,
            makeMarkdown(information["provider"], 2, "Information Provider", true),
            makeMarkdown(information["warnings"], 2, "Warnings"),
            makeMarkdown(information["os"], 2, "OS Information"),
            makeMarkdown(information["process"], 2, "Process Information"),
            makeMarkdown(information["vscode"], 2, "VS Code Information", true),
        ]
        .filter(i => undefined !== i)
        .join("\n");
    };
    export const showSchema = async (): Promise<void> =>
    {
        const show = async (uri: string) =>
        {
            const source = (await vscode.workspace.openTextDocument(vscode.Uri.parse(uri))).getText();
            const text = JSON.stringify(JSON.parse(source), null, 4);
            const document = await vscode.workspace.openTextDocument({ language: "json" });
            const textEditor = await vscode.window.showTextDocument(document);
            textEditor.edit
            (
                (editBuilder: vscode.TextEditorEdit) =>
                {
                    editBuilder.insert(new vscode.Position(0,0), text);
                }
            );
        };
        const schemeList =
        [
            "vscode://schemas/settings/default",
            "vscode://schemas/settings/folder",
            "vscode://schemas/settings/machine",
            "vscode://schemas/settings/resourceLanguage",
            "vscode://schemas/settings/user",
            "vscode://schemas/settings/workspace",
            "vscode://schemas/argv",
            "vscode://schemas/color-theme",
            "vscode://schemas/extensions",
            "vscode://schemas/global-snippets",
            "vscode://schemas/icon-theme",
            "vscode://schemas/icons",
            "vscode://schemas/ignoredSettings",
            "vscode://schemas/keybindings",
            "vscode://schemas/language-configuration",
            "vscode://schemas/launch",
            "vscode://schemas/product-icon-theme",
            "vscode://schemas/snippets",
            "vscode://schemas/tasks",
            "vscode://schemas/textmate-colors",
            "vscode://schemas/token-styling",
            "vscode://schemas/vscode-extensions",
            "vscode://schemas/workbench-colors",
            "vscode://schemas/workspaceConfig",
        ];
        await vscel.menu.showQuickPick
        (
            [{
                label: `$(edit) ${locale.map("Input a scheme URI to show")}`,
                command: async ( ): Promise<unknown> => await vscel.menu.showInputBox
                ({
                    placeHolder: "Scheme URI",
                    command: async input => await show(input)
                }),
            }]
            .concat
            (
                schemeList.map
                (
                    i =>
                    ({
                        label: `$(tag) ${i}`,
                        command: async ( ) => await show(i),
                    })
                )
            )
        );
    };
    //  dummy for test
    export const roundZoom = (value: number): number =>
    {
        const cent = 100.0;
        return Math.round(value *cent) /cent;
    };
}
export const activate = (context: vscode.ExtensionContext) => SysInfo.initialize(context);
export const deactivate = () => { };