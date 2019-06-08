# Change Log
All notable changes to the "better-new-file" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [1.1.1] - 2019-06-08
### Fixed
- Fixed an issue on Windows when starting the path with `/`.

## [1.1.0] - 2019-06-08
### New features
- The extension now comes with two new settings `defaultPath` and `showDetails`!
For a detailed list take a look at the [README](README.md#configuration).

### Changed
- The details (when visible) are now relative to the root path of your workspace instead of the current file.
- The required version of VSCode is now `1.29.0`.<br> This change was made due to a new `QuickPickItem` API which made possible to hide the details of items.

### Fixed
- Fixed a bug which prevented loading of the directory content when changing to the same directory from which the prompt was opened.

## [1.0.1] - 2018-08-27
- The quick pick will now be closed after creating a directory.
- Fixed an issue on windows machines.

## [1.0.0] - 2018-08-21
Rewriten almost all of the code comparing to earlier version. For a detailed explanation of the features check out the [README](README.md).
