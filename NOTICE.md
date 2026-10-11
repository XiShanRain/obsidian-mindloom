# Notices

MindLoom is a derivative work. This file records where it comes from and what it builds on.

## Original project

MindLoom is a fork of **obsidian-mindmap**, published as *Mind Elixir Mind Map*, by **ssshooter**:

- Source: https://github.com/ssshooter/obsidian-mindmap
- License: 0BSD (see [LICENSE](LICENSE))

The original project provides the markdown and plaintext parsing, the mind map view, the `mindelixir` code block rendering and the export button. MindLoom keeps that behaviour and adds:

- a frame for embedded maps that is sized to the rendered content,
- a setting for the content position inside that frame (left, center, right),
- a drag handle on the bottom edge of the frame to size it by hand,
- live re-layout of open maps when a layout setting changes.

The original screenshots are not redistributed with this project; add your own under `screenshots/`.

## Third party components

| Component | Author | License |
| --- | --- | --- |
| [Mind Elixir](https://github.com/SSShooter/mind-elixir-core) | ssshooter | MIT |
| [@mind-elixir/export-mindmap](https://github.com/SSShooter/mind-elixir-core) | ssshooter | MIT |
| [KaTeX](https://katex.org/) | Khan Academy | MIT |
| [remark](https://github.com/remarkjs/remark), [rehype](https://github.com/rehypejs/rehype), [unified](https://github.com/unifiedjs/unified) | unified collective | MIT |
| [Obsidian sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin) | Dynalist Inc. | 0BSD |

Mind Elixir and the other libraries above are bundled into `main.js` by the build. Their license metadata is available in `node_modules` after an install.

## Copyright

Copyright (C) 2020-2025 by Dynalist Inc.
Copyright (C) 2025 by 西山雨
