import * as vscode from 'vscode';
import * as path from 'path';
import FileManager, { Base } from './FileManager';

interface FileQuickPickItem extends vscode.QuickPickItem {
  directory: boolean;
}

export default class QuickPick {
  quickPick: vscode.QuickPick<FileQuickPickItem>;
  fm: FileManager;
  oldPath: string;

  constructor(base: Base) {
    this.fm = new FileManager(base);
    this.oldPath = this.fm.getUri().fsPath;

    this.quickPick = vscode.window.createQuickPick<FileQuickPickItem>();
    this.quickPick.matchOnDetail = true;
    this.quickPick.matchOnDescription = true;

    this.quickPick.onDidHide(() => this.quickPick.dispose());
    this.quickPick.onDidAccept(() => {
      const selected = this.quickPick.selectedItems[0]

      // A hack for ignoring duplicate firing of the event when items
      // are changed. Need to investigate whether it's a bug in the code.
      if (!selected && this.quickPick.activeItems.length > 0) {
        return
      }

      this.accept(selected);
    });

    this.quickPick.onDidChangeValue((value) => {
      this.changePath(value);
    });
  }

  changePath(input: string) {
    // The "gibberish" part is for getting around the fact, that `.dirname()`
    // does omit the directory seperator at the end. We don't want that.
    const newPath = path.normalize(path.dirname(this.fm.getUri(input).fsPath + '__gibberish__'));

    // The relative path is non needed here but might come in handy
    // in the future. Just leaving it here for the future.
    // const relative = path.relative(this.fm.getUri().fsPath, newPath);

    // console.log(this.oldPath, newPath, relative);

    if(newPath !== this.oldPath) {
      if(input) {
        this.quickPick.value = path.normalize(input);
      }
      this.setItems(input);
    }

    this.oldPath = newPath;
  }

  async accept(selected) {
    if (selected === undefined) {
      const path = await this.createNew();
      this.fm.openFile(path);
    } else {
      if (selected.directory) {
        this.changePath(selected.detail + '/');
      } else {
        this.fm.openFile(selected.detail);
      }
    }
  }

  async createNew(): Promise<string> {
    const path = this.quickPick.value;
    try {
      await this.fm.writeFile(this.fm.getUri(path), new Uint8Array(0), { create: true, overwrite: false });
    } catch(e) {
      console.log(e);
    }
    return path;
  }

  async show() {
    this.setItems('');
    this.quickPick.show();
  }

  async setItems(path: string) {
    this.quickPick.enabled = false;
    const content = await this.fm.getContent(path);
    content.push(['..', vscode.FileType.Directory]);
    content.sort((a, b) => {
      if(a[1] > b[1]) return -1;
      if(a[1] < b[1]) return 1;

      if(a[0] < b[0]) return -1;
      if(a[0] > b[0]) return 1;
      return 0;
    })
    this.quickPick.items = content.map(item => {
      const isDir = item[1] === vscode.FileType.Directory;
      const icon = isDir ? '$(file-directory)' : '$(file)';

      return {
        label: `${icon} ${item[0]}`,
        detail: this.quickPick.value + item[0],
        directory: isDir
      }
    });

    this.quickPick.enabled = true;
  }
}
