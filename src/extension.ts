'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as os from 'os';

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
        withoutInactiveExtensions : boolean;
    }

    export function getSystemInformation(options : GetSystemInformationOptions) : object
    {
        const thisExtension = vscode.extensions.getExtension("wraith13.sysinfo-vscode");
        return pass_through =
        {
            "timestamp": new Date().toISOString(),
            "provider":
            {
                "name": thisExtension && thisExtension.packageJSON.name,
                "displayName": thisExtension && thisExtension.packageJSON.displayName,
                "version": thisExtension && thisExtension.packageJSON.version,
                "options": options,
            },
            "os": 0 <= options.categories.indexOf("basic") ?
            {
                "arch": os.arch(),
                "platform": os.platform(),
                "type": os.type(),
                "release": os.release(),
                "cpus": 0 <= options.categories.indexOf("cpu") ? os.cpus(): undefined,
                "networkInterfaces": 0 <= options.categories.indexOf("network") && options.withSensitiveData ? os.networkInterfaces(): undefined,
                "hostname": options.withSensitiveData ? os.hostname(): undefined,
                "homedir": options.withSensitiveData ? os.homedir(): undefined,
                "tmpdir": options.withSensitiveData ? os.tmpdir(): undefined,
            } : undefined,
            "process": 0 <= options.categories.indexOf("basic") ?
            {
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
    export function getExtentionsformation(options : GetSystemInformationOptions) : object
    {
        return vscode.extensions.all
        .filter
        (
            extension =>
                (options.withInternalExtensions || !extension.id.startsWith("vscode.")) &&
                (!options.withoutInactiveExtensions || extension.isActive)
        )
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
    async function openNewTextDocument(language : string) : Promise<vscode.TextDocument>
    {
        return await vscode.workspace.openTextDocument({ language });
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
        const selectedCategories =  await vscode.window.showQuickPick
        (
            [
                {
                    "label": "Basic System Information",
                    "description": "",
                    "detail": "basic"
                },
                {
                    "label": "Extensions Information",
                    "description": "",
                    "detail": "extensions"
                },
                {
                    "label": "Full System Information",
                    "description": "",
                    "detail": "basic, cpu, network, extensions"
                }
            ],
            {
                placeHolder: "Select categories option",
            }
        );
        if (!selectedCategories)
        {
            return;
        }
        const categories = selectedCategories.detail.split(",").map(i => i.trim());
        const withSensitiveData = await vscode.window.showQuickPick
        (
            [
                {
                    "label": "without Sensitive Data",
                    "description": "recommend",
                    "detail": "false"
                },
                {
                    "label": "with Sensitive Data",
                    "description": "",
                    "detail": "true"
                }
            ],
            {
                placeHolder: "Select withSensitiveData option",
            }
        );
        if (!withSensitiveData)
        {
            return;
        }
        const withInternalExtensions = 0 <= categories.indexOf("extensions") ?
            await vscode.window.showQuickPick
            (
                [
                    {
                        "label": "without Internal Extensions",
                        "description": "recommend",
                        "detail": "false"
                    },
                    {
                        "label": "with Internal Extensions",
                        "description": "true",
                        "detail": ""
                    }
                ],
                {
                    placeHolder: "Select withInternalExtensions option",
                }
            ):
            {
                "label": "without Internal Extensions",
                "description": "recommend",
                "detail": "false"
            };
        if (!withInternalExtensions)
        {
            return;
        }
        const withoutInactiveExtensions = 0 <= categories.indexOf("extensions") ?
            await vscode.window.showQuickPick
            (
                [
                    {
                        "label": "with Inactive Extensions",
                        "description": "recommend",
                        "detail": "false"
                    },
                    {
                        "label": "without Inactive Extensions",
                        "description": "",
                        "detail": "true"
                    }
                ],
                {
                    placeHolder: "Select withoutInactiveExtensions option",
                }
            ):
            {
                "label": "with Inactive Extensions",
                "description": "recommend",
                "detail": "false"
            };
        if (!withoutInactiveExtensions)
        {
            return;
        }
        const information = getSystemInformation
        (
            {
                categories: categories,
                withSensitiveData: "true" === withSensitiveData.detail,
                withInternalExtensions: "true" === withInternalExtensions.detail,
                withoutInactiveExtensions: "true" === withoutInactiveExtensions.detail,
            }
        );
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
                placeHolder: "Select a format",
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
    function makeMarkdownHeader(level : number, title : string) : string
    {
        return `${"#".repeat(level)} ${title}\n`;
    }
    function makeMarkdownTable(data : any, level : number = 2, title? : string) : string
    {
        return pass_through =
        [
            title ? makeMarkdownHeader(level, title): null,
            "| key | value |",
            "|---|---|",
        ]
        .concat
        (
            Object.getOwnPropertyNames(data)
                .filter(key => ("object" !== practicalTypeof(data[key]) || 0 === Object.getOwnPropertyNames(data[key]).length) && ("array" !== practicalTypeof(data[key]) || 0 === data[key].length || "string" === practicalTypeof(data[key][0])) && undefined !== data[key])
                .map(key => `| ${key} | ${"string" === practicalTypeof(data[key]) ? data[key] :JSON.stringify(data[key])} |`)
        )
        .join("\n") +"\n"
        +Object.getOwnPropertyNames(data)
            .filter(key => "object" === practicalTypeof(data[key]) && 0 < Object.getOwnPropertyNames(data[key]).length)
            .map(key => "\n" + makeMarkdownTable(data[key], level +1, key))
        +Object.getOwnPropertyNames(data)
            .filter(key => "array" === practicalTypeof(data[key]) && 0 < data[key].length && "string" !== practicalTypeof(data[key][0]))
            .map
            (
                key =>
                    "\n"
                    +makeMarkdownHeader(level +1, key)
                    +data[key].map((i : any, index : number) => makeMarkdownTable(i, level +2, `${index}`)).join("\n")
            ).join("\n");
    }
    export function informationToMarkdown(information : any) : string
    {
        return pass_through =
        [
            makeMarkdownHeader(1, "VSCode System Information"),
            `timestamp: ${information["timestamp"]}`,
            makeMarkdownHeader(2, "Information Provider"),
            makeMarkdownTable(information["provider"]),
            information["os"] ? makeMarkdownHeader(2, "OS Information") : undefined,
            information["os"] ? makeMarkdownTable(information["os"]) : undefined,
            information["process"] ? makeMarkdownHeader(2, "Process Information") : undefined,
            information["process"] ? makeMarkdownTable(information["process"]) : undefined,
            makeMarkdownHeader(2, "VSCode Information"),
            makeMarkdownTable(information["vscode"]),
        ]
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