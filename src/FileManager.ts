import { Uri, workspace } from 'vscode';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as fs from 'fs';

export default class FileManager {
  private base: Uri;
  private root: Uri = workspace.workspaceFolders[0].uri;

  constructor(base: Uri) {
    this.base = Uri.file(path.dirname(base.fsPath));
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
      return this.root.fsPath;
    }

    return this.base.fsPath;
  }

  static isDir(path: string) {
    return path.endsWith('/');
  }
}
