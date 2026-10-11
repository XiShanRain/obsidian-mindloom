[English](README.md) | [中文](README_zh.md)

# MindLoom

Weave your notes into interactive mind maps.

MindLoom renders [Mind Elixir](https://github.com/SSShooter/mind-elixir-core) mind maps inside Obsidian. Open any note as a mind map in a split pane, or embed a map directly in a note with a `mindelixir` code block. Embedded frames are sized to their content instead of leaving a large empty box.

> MindLoom is a fork of [obsidian-mindmap](https://github.com/ssshooter/obsidian-mindmap) by [ssshooter](https://github.com/SSShooter). Thanks to the original author, see [Credits](#credits).

## Features

### Mind map view

- **Open as mind map**: turn any markdown file into an interactive mind map
- **Smart parsing**: markdown headings and lists become a hierarchy of nodes
- **Split view**: the map opens in a split pane while your document stays where it is
- **Auto refresh**: the map follows changes made to the source file
- **Customizable root**: use the filename or the first level 1 heading as the root node

### Embedded mind maps

- **Inline maps**: embed a map in a note with a `mindelixir` code block
- **Fitted frame**: the frame is sized to the content, so a small map gets a small frame
- **Content position**: place a map at the left, center or right of its frame
- **Manual resize**: drag the bottom edge of a frame to size it by hand, and double-click that edge to fit the content again
- **Export**: save a map as a PNG image
- **Working links**: internal links and images inside topics behave as they do in a note

### Mobile support

MindLoom works on Obsidian mobile, including touch friendly resize controls.

## Installation

### Community plugin browser

MindLoom is not in the community plugin list yet. Once it has been reviewed, search for **MindLoom** in **Settings > Community plugins > Browse**.

### Manual installation

1. Download `main.js`, `manifest.json` and `styles.css` from the [latest release](https://github.com/XiShanRain/obsidian-mindloom/releases/latest).
2. Create the folder `<Vault>/.obsidian/plugins/mindloom/`.
3. Copy the three files into that folder.
4. Reload Obsidian and enable **MindLoom** in **Settings > Community plugins**.

### BRAT (beta versions)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin.
2. Run **BRAT: Add a beta plugin for testing**.
3. Enter `XiShanRain/obsidian-mindloom`.

## Usage

### Embedded mind maps

Add a `mindelixir` code block to a note. Indentation defines the hierarchy, one tab or two spaces per level:

```mindelixir
Programming
	Paradigms
		Object oriented
		Functional
	Languages
		Rust
		TypeScript
```

The frame hugs the map. Drag the small handle on its bottom edge to resize the frame, or double-click the handle to fit the content again.

### Mind map view

1. Open the markdown file you want to map.
2. Click the map icon in the ribbon, or run **MindLoom: Open** from the command palette.
3. The file opens as a mind map in a split pane.

Files written in the Mind Elixir plaintext format, that is, content that starts with `- `, open as an **editable** map: changes made in the map are written back to the file. Markdown files opened in the view are read only.

## Settings

**Settings > MindLoom**

| Setting | Description | Default |
| --- | --- | --- |
| **Use first level 1 heading as root** | Use the first level 1 heading as the root node instead of the filename. Content before it is ignored. | Off |
| **Content position in the frame** | Where to place an embedded map inside its frame: **Left**, **Center** or **Right**. | Left |

## Development

```bash
pnpm install       # or npm install
pnpm run dev       # rebuild on change
pnpm run build     # type check, then write main.js and styles.css
pnpm run lint
```

To try a build, copy `main.js`, `manifest.json` and `styles.css` into `<Vault>/.obsidian/plugins/mindloom/` and reload Obsidian.

## Credits

MindLoom is a fork of [obsidian-mindmap](https://github.com/ssshooter/obsidian-mindmap), published as *Mind Elixir Mind Map*, by [ssshooter](https://github.com/SSShooter) and released under 0BSD. The original project provides the markdown and plaintext parsing, the mind map view and the `mindelixir` code block rendering. MindLoom adds the fitted frame, its resize handle, the content position setting and the live re-layout. Thank you to the original author for the foundation.

It also builds on:

- [Mind Elixir](https://github.com/SSShooter/mind-elixir-core) by ssshooter (MIT), the mind map engine
- [@mind-elixir/export-mindmap](https://github.com/SSShooter/mind-elixir-core) (MIT), PNG export
- [Obsidian sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin) by Dynalist Inc. (0BSD), the plugin scaffold

## License

[0BSD](LICENSE). See [NOTICE.md](NOTICE.md) for full attribution.
