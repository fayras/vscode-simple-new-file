'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import FileManager from './FileManager';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.simpleNewFile', async () => {
        if (!vscode.window.activeTextEditor) {
            return;  // no file open
        }

        let basePath = vscode.window.activeTextEditor.document.uri;
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
