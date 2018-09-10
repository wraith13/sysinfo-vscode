'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as os from 'os';

export module SysInfo
{
    var pass_through;

    const cent = 100.0;
    const systemZoomUnit = 20.0;
    const systemZoomUnitRate = (systemZoomUnit + cent) / cent;
    const zoomLog = Math.log(systemZoomUnitRate);

    function distinctFilter<type>(value : type, index : number, self : type[]) : boolean
    {
        return index === self.indexOf(value);
    }

    function getConfiguration<type>(key? : string, section : string = "sysinfo") : type
    {
        const configuration = vscode.workspace.getConfiguration(section);
        return key ?
            configuration[key] :
            configuration;
    }
    function getZoomLevel() : number
    {
        return getConfiguration<number>("zoomLevel", "window") || 0.0;
    }
    function setZoomLevel(zoomLevel : number) : void
    {
        vscode.workspace.getConfiguration("window").update("zoomLevel", zoomLevel, true);
    }
    function getDefaultZoom() : number
    {
        return getConfiguration<number>("defaultZoom");
    }
    function getZoomUnit() : number
    {
        return getConfiguration<number>("zoomUnit");
    }
    function getZoomUnitLevel() : number
    {
        return percentToLevel(cent +getZoomUnit());
    }
    function getZoomPreset() : number[]
    {
        return getConfiguration<number[]>("zoomPreset")
            .filter(distinctFilter)
            .sort((a,b) => b - a);
    }

    export function registerCommand(context : vscode.ExtensionContext): void
    {
        context.subscriptions.push
        (
            vscode.commands.registerCommand
            (
                'sysinfo-vscode.selectZoom', selectZoom
            )
        );
        context.subscriptions.push
        (
            vscode.commands.registerCommand
            (
                'sysinfo-vscode.resetZoom', resetZoom
            )
        );
        context.subscriptions.push
        (
            vscode.commands.registerCommand
            (
                'sysinfo-vscode.zoomIn', zoomIn
            )
        );
        context.subscriptions.push
        (
            vscode.commands.registerCommand
            (
                'sysinfo-vscode.zoomOut', zoomOut
            )
        );

       console.log(`getSystemInformation(): ${JSON.stringify(getSystemInformation({withSensitiveData:false}), null, 4)}`);
    }

    interface GetSystemInformationOptions
    {
        withSensitiveData ? : boolean;
        withInternalExtensions ? : boolean;
        withoutInactiveExtensions ? : boolean;
    }

    export function getSystemInformation(options : GetSystemInformationOptions) : object
    {
        return pass_through =
        {
            "os":
            {
                "arch": os.arch(),
                "platform": os.platform(),
                "type": os.type(),
                "release": os.release(),
                "cpus": os.cpus(),
                "networkInterfaces": options.withSensitiveData ? os.networkInterfaces(): undefined,
                "hostname": options.withSensitiveData ? os.hostname(): undefined,
                "homedir": options.withSensitiveData ? os.homedir(): undefined,
                "tmpdir": options.withSensitiveData ? os.tmpdir(): undefined,
            },
            "process":
            {
                "arch": process.arch,
                "execPath": options.withSensitiveData ? process.execPath: undefined,
                "execArgv": options.withSensitiveData ? process.execArgv: undefined,
                "env":
                {
                    "LANG": process.env.LANG,
                }
            },
            "vscode":
            {
                "version": vscode.version,
                "env":
                {
                    "appName": vscode.env.appName,
                    "language": vscode.env.language
                },
                "extensions": vscode.extensions.all
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
                )
            },
        };
    }

    export async function selectZoom() : Promise<void>
    {
        const currentZoom = roundZoom(levelToPercent(getZoomLevel()));
        const select = await vscode.window.showQuickPick
        (
            [
                {
                    label: `Reset zoom`,
                    description: "",
                    detail: getDefaultZoom().toString(),
                },
                {
                    label: `Input zoom`,
                    description: "",
                    detail: "*",
                }
            ]
            .concat
            (
                getZoomPreset().map
                (
                    i => pass_through =
                    {
                        label: percentToDisplayString(i),
                        description: currentZoom === roundZoom(i) ? "(current)": "",
                        detail: i.toString()
                    }
                )
            ),
            {
                placeHolder: "Select a zoom",
            }
        );
        if (select)
        {
            if ("*" === select.detail)
            {
                let zoom : any = await vscode.window.showInputBox
                (
                    {
                        prompt: "Input a zoom",
                        value: currentZoom.toString(),
                    }
                );
                if (undefined !== zoom)
                {
                    setZoomLevel(percentToLevel(parseFloat(zoom)));
                }
            }
            else
            {
                setZoomLevel(percentToLevel(parseFloat(select.detail)));
            }
        }
    }
    export async function resetZoom() : Promise<void>
    {
        setZoomLevel(percentToLevel(getDefaultZoom()));
    }
    export async function zoomOut() : Promise<void>
    {
        setZoomLevel(getZoomLevel() -getZoomUnitLevel());
    }
    export async function zoomIn() : Promise<void>
    {
        setZoomLevel(getZoomLevel() +getZoomUnitLevel());
    }
    export function levelToPercent(value : number) : number
    {
        return Math.pow(systemZoomUnitRate, value) * cent;
    }
    export function percentToLevel(value : number) : number
    {
        return Math.log(value / cent) / zoomLog;
    }
    export function roundZoom(value : number) : number
    {
        return Math.round(value *cent) /cent;
    }
    export function percentToDisplayString(value : number, locales?: string | string[]) : string
    {
        return `${roundZoom(value / cent).toLocaleString(locales, { style: "percent" })}`;
    }
}

export function activate(context: vscode.ExtensionContext) : void
{
    SysInfo.registerCommand(context);
}

export function deactivate() : void
{
}