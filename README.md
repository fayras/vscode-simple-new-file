# Simple New File

This extension makes creating file really easy.

Pressing `CTRL + ALT + N` brings up a prompt where you can enter a path to a file. The file will be opened if it exists otherwise a new file will be created along with all its parent directories.

Typing in `path/to/a/new.file will result in the following tree structure.

```
- path
  - to
    - a
      new.file
```

Paths can also have relative parts: `path/to/../a/new.file` will get you
```
- path
  - a
    new.file
```

Paths are being treated as relative to the current open file. You can also specify an absolute path by beginning with `/`. (`/path/to...` for example)

You can also create directories by putting a `/` at the ending of a path. `path/to/dir/` will create the `dir` as a directory instead of a file.
