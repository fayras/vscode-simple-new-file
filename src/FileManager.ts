import * as vscode from 'vscode';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as fs from 'fs';

import FileStat from './FileStat';

export interface Base {
  path: vscode.Uri;
  type: 'file' | 'workspace';
}

function handleResult<T>(resolve: (result: T) => void, reject: (error: Error) => void, error: Error | null | undefined, result: T): void {
  if (error) {
      reject(massageError(error));
  } else {
      resolve(result);
  }
}

function massageError(error: Error & { code?: string }): Error {
  if (error.code === 'ENOENT') {
      return vscode.FileSystemError.FileNotFound();
  }

  if (error.code === 'EISDIR') {
      return vscode.FileSystemError.FileIsADirectory();
  }

  if (error.code === 'EEXIST') {
      return vscode.FileSystemError.FileExists();
  }

  if (error.code === 'EPERM' || error.code === 'EACCESS') {
      return vscode.FileSystemError.NoPermissions();
  }

  return error;
}

function normalizeNFC(items: string): string;
function normalizeNFC(items: string[]): string[];
function normalizeNFC(items: string | string[]): string | string[] {
  if (process.platform !== 'darwin') {
    return items;
  }

  if (Array.isArray(items)) {
    return items.map(item => item.normalize('NFC'));
  }

  return items.normalize('NFC');
}

export default class FileManager {
  private base: vscode.Uri;
  private root: vscode.WorkspaceFolder | undefined;

  constructor(base: Base) {
    if(base.type === 'file') {
      this.base = vscode.Uri.file(path.dirname(base.path.fsPath));
    } else {
      this.base = base.path;
    }

    this.root = vscode.workspace.getWorkspaceFolder(this.base);
  }

  getContent(path: string = '') {
    return this.readDirectory(this.getUri(path));
  }

  getUri(path: string = undefined) {
    const sufix = path ? '/' + path : '';

    if(path !== undefined && path.startsWith('/')) {
      return vscode.Uri.file(this.root.uri.fsPath + sufix);
    }

    return vscode.Uri.file(this.base.fsPath + sufix);
  }

  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
    return this._readDirectory(uri);
  }

  async _readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
    const children = await this.readdir(uri.fsPath);

    const result: [string, vscode.FileType][] = [];
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const stat = await this._stat(path.join(uri.fsPath, child));
        result.push([child, stat.type]);
    }

    return Promise.resolve(result);
  }

  readdir(path: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        fs.readdir(path, (error, children) => handleResult(resolve, reject, error, normalizeNFC(children)));
    });
  }

  stat(uri: vscode.Uri): Thenable<vscode.FileStat> {
    return this._stat(uri.fsPath);
  }

  private async _stat(path: string): Promise<vscode.FileStat> {
    return new FileStat(await this.getFsStat(path));
  }

  private getFsStat(path: string): Promise<fs.Stats> {
    return new Promise<fs.Stats>((resolve, reject) => {
        fs.stat(path, (error, stat) => handleResult(resolve, reject, error, stat));
    });
  }
}
