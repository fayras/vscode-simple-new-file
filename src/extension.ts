'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { Base } from './FileManager';
import QuickPick from './QuickPick';

async function getBasePath(): Promise<Base | undefined> {
    const workspaceExists = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0;
    if (!vscode.window.activeTextEditor && !workspaceExists) {
        vscode.window.showInformationMessage('You do not have any workspaces open.');
        return undefined;
    }

    if (vscode.window.activeTextEditor) {
        return {
            path: vscode.window.activeTextEditor.document.uri,
            type: 'file'
        };
    } else if (vscode.workspace.workspaceFolders.length === 1) {
        return {
            path: vscode.workspace.workspaceFolders[0].uri,
            type: 'workspace'
        };
    } else {
        const ws = await vscode.window.showWorkspaceFolderPick();
        return {
            path: ws.uri,
            type: 'workspace'
        };
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.simpleNewFile', async () => {
        const base = await getBasePath();

        if (!base) {
            return;
        }

        const qp = new QuickPick(base);
        qp.show();
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
