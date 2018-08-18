'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import FileManager from './FileManager';

async function getBasePath(): Promise<vscode.Uri | undefined> {
    const workspaceExists = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0;
    if (!vscode.window.activeTextEditor && !workspaceExists) {
        vscode.window.showInformationMessage('You do not have any workspaces open.');
        return undefined;
    }

    if (vscode.window.activeTextEditor) {
        return vscode.window.activeTextEditor.document.uri;
    } else if (vscode.workspace.workspaceFolders.length === 1) {
        return vscode.workspace.workspaceFolders[0].uri;
    } else {
        const ws = await vscode.window.showWorkspaceFolderPick();
        return ws.uri;
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.simpleNewFile', async () => {
        const basePath = await getBasePath();

        if (!basePath) {
            return;
        }

        let fileManager = new FileManager(basePath);

        let path = await vscode.window.showInputBox({
            prompt: `Current directory: ${fileManager.getBase()}${' '.repeat(100)}`
        });

        if(!path || path === '') {
            return;
        }

        let newFilePath = await fileManager.create(path);
        if(!FileManager.isDir(newFilePath)) {
            let doc = await vscode.workspace.openTextDocument(newFilePath);
            vscode.window.showTextDocument(doc);
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
