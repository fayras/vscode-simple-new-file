import * as vscode from 'vscode';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as fs from 'fs';

import FileStat from './FileStat';

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

export default class FileManager {
  private root: vscode.WorkspaceFolder | undefined;

  constructor(private base: vscode.Uri) {
    this.root = vscode.workspace.getWorkspaceFolder(base);
  }

  create(pPath: string): Promise<string> {
    let base = this.getBase(pPath);

    return new Promise((resolve, reject) => {
      let filePath = path.join(base, pPath);
      fs.exists(filePath, (exists: boolean) => {
        if (exists) {
          resolve(filePath);
        } else {
          let dirPath = FileManager.isDir(filePath) ? filePath : path.dirname(filePath);
          mkdirp.sync(dirPath);
          if(!FileManager.isDir(filePath)) {
            fs.writeFile(filePath, '', (err: NodeJS.ErrnoException) => {
              if(err) {
                reject(err.message);
              } else {
                resolve(filePath);
              }
            });
          } else {
            resolve(filePath);
          }
        }
      });
    });
  }

  getBase(path: string = undefined) {
    if(path !== undefined && path.startsWith('/')) {
      return this.root.uri.fsPath;
    }

    return this.base.fsPath;
  }

  static isDir(path: string) {
    return path.endsWith('/');
  }

  static stat(uri: vscode.Uri): Thenable<vscode.FileStat> {
    return FileManager._stat(uri.fsPath);
  }

  private static async _stat(path: string): Promise<vscode.FileStat> {
    return new FileStat(await FileManager.getFsStat(path));
  }

  private static getFsStat(path: string): Promise<fs.Stats> {
    return new Promise<fs.Stats>((resolve, reject) => {
        fs.stat(path, (error, stat) => handleResult(resolve, reject, error, stat));
    });
  }
}
