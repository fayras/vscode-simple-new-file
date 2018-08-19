import * as vscode from 'vscode';
import * as path from 'path';
import FileSystemProvider from './FileSystemProvider';

export interface Base {
  path: vscode.Uri;
  type: 'file' | 'workspace';
}

export default class FileManager extends FileSystemProvider {
  private base: vscode.Uri;
  private root: vscode.WorkspaceFolder | undefined;

  constructor(base: Base) {
    super();
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
}
