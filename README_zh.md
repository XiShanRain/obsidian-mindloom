[English](README.md) | [中文](README_zh.md)

# MindLoom

把笔记编织成可交互的思维导图。

MindLoom 在 Obsidian 中渲染 [Mind Elixir](https://github.com/SSShooter/mind-elixir-core) 思维导图：可以把任意笔记在分屏中打开为导图，也可以用 `mindelixir` 代码块把导图直接嵌入笔记。嵌入的边框会随内容大小自动贴合，不再留下大片空白。

> MindLoom 是 [ssshooter](https://github.com/SSShooter) 的开源项目 [obsidian-mindmap](https://github.com/ssshooter/obsidian-mindmap) 的衍生项目。感谢原作者的付出，详见 [致谢](#致谢)。

## 功能特性

### 思维导图视图

- **打开为思维导图**：把任意 Markdown 文件变成可交互的导图
- **智能解析**：Markdown 标题与列表自动转换为层级节点
- **分屏视图**：导图在分屏中打开，原文档保持不变
- **自动刷新**：源文件变更时导图会自动更新
- **自定义根节点**：可使用文件名或第一个一级标题作为根节点

### 嵌入的思维导图

- **内嵌导图**：用 `mindelixir` 代码块在笔记中嵌入导图
- **边框自适应**：边框按内容大小自动收缩，内容少则边框小
- **内容位置**：可把导图放在边框的左侧、居中或右侧
- **手动调整**：拖动边框底边中间的手柄可自行调整高度，双击手柄恢复自动贴合
- **导出图片**：可把导图导出为 PNG
- **链接可用**：节点内的内链和图片与在笔记中一样可以点击

### 移动端支持

MindLoom 在 Obsidian 移动端同样可用，并提供适合触屏的调整方式。

## 安装

### 社区插件市场

MindLoom 暂未进入社区插件列表。通过审核后，可在 **设置 > 第三方插件 > 浏览** 中搜索 **MindLoom**。

### 手动安装

1. 从 [最新 Release](https://github.com/XiShanRain/obsidian-mindloom/releases/latest) 下载 `main.js`、`manifest.json` 与 `styles.css`。
2. 新建目录 `<Vault>/.obsidian/plugins/mindloom/`。
3. 把三个文件复制进去。
4. 重启 Obsidian，在 **设置 > 第三方插件** 中启用 **MindLoom**。

### BRAT（测试版）

1. 安装 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件。
2. 执行命令 **BRAT: Add a beta plugin for testing**。
3. 输入 `XiShanRain/obsidian-mindloom`。

## 使用方法

### 嵌入思维导图

在笔记中添加 `mindelixir` 代码块，用缩进表示层级（每级一个制表符或两个空格）：

```mindelixir
原生类型
	标量类型
		整型
		浮点型
		布尔值
		字符型
```

边框会自动贴合导图。拖动底边中间的小手柄可以调整边框高度，双击手柄则恢复自动贴合。

### 思维导图视图

1. 打开要转换的 Markdown 文件。
2. 点击左侧功能区的导图图标，或在命令面板执行 **MindLoom: Open**。
3. 文件会在分屏中打开为思维导图。

如果文件使用 Mind Elixir 纯文本格式（内容以 `- ` 开头），打开后是**可编辑**的导图：在导图中的修改会自动写回文件。以 Markdown 解析的视图是只读的。

## 设置

**设置 > MindLoom**

| 设置项 | 说明 | 默认值 |
| --- | --- | --- |
| **Use first level 1 heading as root** | 使用第一个一级标题作为根节点，而不是文件名。该标题之前的内容会被忽略。 | 关闭 |
| **Content position in the frame** | 嵌入导图在边框中的位置：**Left**（左）、**Center**（中）、**Right**（右）。 | Left |

## 开发

```bash
pnpm install       # 或 npm install
pnpm run dev       # 监听改动并重新构建
pnpm run build     # 类型检查后生成 main.js 与 styles.css
pnpm run lint
```

本地测试：把 `main.js`、`manifest.json`、`styles.css` 复制到 `<Vault>/.obsidian/plugins/mindloom/` 后重载 Obsidian。

## 致谢

MindLoom 衍生自 [ssshooter](https://github.com/SSShooter) 的开源项目 [obsidian-mindmap](https://github.com/ssshooter/obsidian-mindmap)（发布名为 *Mind Elixir Mind Map*，0BSD 许可）。原项目提供了 Markdown 与纯文本解析、思维导图视图以及 `mindelixir` 代码块渲染；MindLoom 在此基础上增加了边框自适应、拖拽调整手柄、内容位置设置和实时重排。感谢原作者打下的基础。

同时感谢以下项目：

- [Mind Elixir](https://github.com/SSShooter/mind-elixir-core)（作者 ssshooter，MIT）——思维导图内核
- [@mind-elixir/export-mindmap](https://github.com/SSShooter/mind-elixir-core)（MIT）——PNG 导出
- [Obsidian 示例插件](https://github.com/obsidianmd/obsidian-sample-plugin)（Dynalist Inc.，0BSD）——插件脚手架

## 许可证

[0BSD](LICENSE)，完整署名信息见 [NOTICE.md](NOTICE.md)。
