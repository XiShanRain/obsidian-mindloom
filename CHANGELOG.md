# Changelog

All notable changes to MindLoom are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-11

First release of MindLoom, based on version 4.0.0 of [obsidian-mindmap](https://github.com/ssshooter/obsidian-mindmap) by ssshooter.

### Added

- Embedded `mindelixir` code blocks are now sized to the rendered map instead of using a fixed 600px height.
- The map is centered vertically inside a fitted frame, so the bottom of the map is no longer clipped.
- Setting **Content position in the frame**, with **Left**, **Center** and **Right** options (default **Left**).
- Resize handle on the bottom edge of an embedded frame: drag to size the frame by hand, double-click to fit the content again.
- Live re-layout, so changing a layout setting updates maps that are already open.

### Changed

- Code block rendering moved into its own module, `src/codeblock.ts`, which cleans up its observers and timers when a block is unloaded.
- The resize handle and export button are styled from code, so they keep working when an older `styles.css` is still installed next to a new `main.js`.
- Project metadata, documentation and attribution updated for the MindLoom fork.
