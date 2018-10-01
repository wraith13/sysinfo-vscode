'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as os from 'os';

import localeEn from "../package.nls.json";
import localeJa from "../package.nls.ja.json";

const localeTable : { [key : string] : string } = Object.assign(localeEn, ((<any>{
    ja : localeJa
})[<string>JSON.parse(<string>process.env.VSCODE_NLS_CONFIG).locale] || { }));
const locale = (key : string) : string => localeTable[key] || `locale("${key}")`;

export module SysInfo
{
    var pass_through;

    const practicalTypeof = function(obj : any) : string
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

    function getConfiguration<type>(key? : string, section : string = "sysinfo") : type
    {
        const configuration = vscode.workspace.getConfiguration(section);
        return key ?
            configuration[key] :
            configuration;
    }

    export function registerCommand(context : vscode.ExtensionContext): void
    {
        context.subscriptions.push
        (
            vscode.commands.registerCommand
            (
                'sysinfo-vscode.showSystemInformation', showSystemInformation
            )
        );
    }

    interface GetSystemInformationOptions
    {
        categories : string[];
        withSensitiveData : boolean;
        withInternalExtensions : boolean;
    }

    export function getSystemInformation(options : GetSystemInformationOptions) : object
    {
        const thisExtension = vscode.extensions.getExtension("wraith13.sysinfo-vscode");
        return pass_through =
        {
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
            } : undefined,
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
            } : undefined,
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
    }
    interface Extension
    {
        id : string;
    }
    function isInternalExtension(extension : Extension) : boolean
    {
        return extension.id.startsWith("vscode.");
    }
    export function getExtentionsformation(options : GetSystemInformationOptions) : object
    {
        return vscode.extensions.all
        .filter(extension => (options.withInternalExtensions || !isInternalExtension(extension)))
        .map
        (
            extension => pass_through =
            {
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
            }
        );
    }
    export function systemLint(information : any) : any
    {
        if ("darwin" === information["os"]["platform"] && undefined === information["process"]["env"]["LANG"])
        {
            information["warnings"] = information["warnings"] || { };
            information["warnings"]["W001"] = locale("W001");
        }
        return information;
    }
    export function hideInformation(information : any) : any
    {
        getConfiguration<string[]>("hideItems").forEach
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
    }

    async function openNewTextDocument(language : string) : Promise<vscode.TextDocument>
    {
        return await vscode.workspace.openTextDocument({ language });
    }
    async function showQuickPick
    (
        items : vscode.QuickPickItem[],
        options: vscode.QuickPickOptions,
        autoSelectedIndex? : number
    )
    : Promise<vscode.QuickPickItem|undefined>
    {
        return undefined === autoSelectedIndex ?
            await vscode.window.showQuickPick(items, options):
            items[autoSelectedIndex];
    }
    async function openNewCodeDocument(language : string, code : string) : Promise<void>
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
    }
    export async function showSystemInformation() : Promise<void>
    {
        const selectedCategories =  await showQuickPick
        (
            [
                {
                    "label": locale("BasicInfo.label"),
                    "description": "",
                    "detail": "basic, extensions"
                },
                {
                    "label": locale("FullInfo.label"),
                    "description": locale("FullInfo.description"),
                    "detail": "basic, cpu, memory, network, extensions"
                }
            ],
            {
                placeHolder: locale("selectCategories.placeHolder"),
            }
        );
        if (!selectedCategories)
        {
            return;
        }
        const categories = (selectedCategories.detail || "").split(",").map(i => i.trim());
        const isFull = selectedCategories.label.toLowerCase().startsWith("full ");
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
        const format =  await vscode.window.showQuickPick
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
                placeHolder: locale("selectFormat.placeHolder"),
            }
        );
        if (!format)
        {
            return;
        }
        await openNewCodeDocument
        (
            format.detail,
            "json" === format.detail ?
                JSON.stringify(information, null, 4):
                informationToMarkdown(information)
        );
    }
    function escapeMarkdown(text : string) : string
    {
        return text.replace(/\\/g, "\\\\");
    }
    function makeMarkdownHeader(level : number, title : string) : string
    {
        return `${"#".repeat(level)} ${escapeMarkdown(title)}\n`;
    }
    function makeMarkdownTable(data : [{key:string,value:any}]) : string
    {
        return pass_through =
        [
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
    }
    function makeMarkdown(data : any, level : number = 2, title? : string, isExtensionData : boolean = false) : string | undefined
    {
        if (!data)
        {
            return undefined;
        }

        const extensionLinks = (isExtensionData && data && data.id && !isInternalExtension(data)) ?
            [
                `- [${locale("link.marketplace.label")}](https://marketplace.visualstudio.com/items?itemName=${data.id})\n`,
                `- [${locale("link.vscode.label")}](vscode:extension/${data.id})\n`
            ]
            .join(""):
            undefined;

        const tableItems : [{key:string,value:any}] = <any>[];
        const arrayItems : [{key:string,value:[any]}] = <any>[];
        const subTables : [{key:string,value:any}] = <any>[];
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

        return pass_through =
        [
            title ? makeMarkdownHeader(level, title): undefined,
            extensionLinks,
            0 < tableItems.length ? makeMarkdownTable(tableItems): undefined,
        ]
        .concat(subTables.map(i => makeMarkdown(i.value, level + 1, i.key, isExtensionData)))
        .concat
        (
            arrayItems.map
            (
                i => pass_through =
                [
                    makeMarkdownHeader(level +1, i.key),
                    undefined
                ]
                .concat
                (
                    i.value.map
                    (
                        (j : any, index : number) => makeMarkdown
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
    }
    export function informationToMarkdown(information : any) : string
    {
        return pass_through =
        [
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
    }

    //  dummy for test
    export function roundZoom(value : number) : number
    {
        const cent = 100.0;
        return Math.round(value *cent) /cent;
    }
}

export function activate(context: vscode.ExtensionContext) : void
{
    SysInfo.registerCommand(context);
}

export function deactivate() : void
{
}