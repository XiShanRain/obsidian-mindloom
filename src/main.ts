import { Plugin, TFile } from "obsidian";
import { MindMapView, VIEW_TYPE_MINDMAP } from "./MindMapView";
import {
	MindMapSettings,
	DEFAULT_SETTINGS,
	MindMapSettingTab,
} from "./settings";
import MindElixir from "mind-elixir";
import { MindElixirContainer, MindmapCodeBlock } from "./codeblock";
import "mind-elixir/style.css";
import "./styles.css";
import "katex/dist/katex.min.css";

export default class MindMapPlugin extends Plugin {
	settings: MindMapSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_MINDMAP,
			(leaf) => new MindMapView(leaf, this.settings),
		);

		this.addCommand({
			id: "open-mindmap",
			name: "Open",
			checkCallback: (checking: boolean) => {
				const file = this.app.workspace.getActiveFile();
				if (file) {
					if (!checking) {
						void this.activateView(file);
					}
					return true;
				}
				return false;
			},
		});

		// Optional: Ribbon icon
		this.addRibbonIcon("map", "Open as mind map", () => {
			const file = this.app.workspace.getActiveFile();
			if (file) {
				void this.activateView(file);
			}
		});

		this.addSettingTab(new MindMapSettingTab(this.app, this));

		// Register markdown code block processor for mindelixir blocks.
		// MindmapCodeBlock renders the map and keeps the block sized to it.
		this.registerMarkdownCodeBlockProcessor(
			"mindelixir",
			(source, el, ctx) => {
				ctx.addChild(new MindmapCodeBlock(this, el, source, ctx));
			},
		);

		// Listen to theme changes
		this.registerEvent(
			this.app.workspace.on("css-change", () => {
				const isDark =
					activeDocument.body.classList.contains("theme-dark");
				const theme = isDark
					? MindElixir.DARK_THEME
					: MindElixir.THEME;

				activeDocument
					.querySelectorAll(".mindelixir-codeblock-container")
					.forEach((el) => {
						const mind = (el as MindElixirContainer)
							.mindElixirInstance;
						if (mind) {
							mind.changeTheme(theme);
						}
					});
			}),
		);
	}

	onunload() {
		// Cleanup if needed
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MindMapSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Re-applies the frame size and content position of every embedded mind
	 * map. Called when a layout setting changes.
	 */
	refreshEmbeddedMindmaps() {
		activeDocument
			.querySelectorAll(".mindelixir-codeblock-container")
			.forEach((el) => {
				(el as MindElixirContainer).mindmapBlock?.relayout();
			});
	}

	async activateView(file: TFile) {
		// Create a new leaf for the mindmap in split right mode
		const leaf = this.app.workspace.getLeaf("split", "vertical");

		await leaf.setViewState({
			type: VIEW_TYPE_MINDMAP,
			active: true,
			state: { filePath: file.path },
		});

		// Ensure settings are up to date in the view
		if (leaf.view instanceof MindMapView) {
			leaf.view.settings = this.settings;
		}

		// Reveal the leaf
		await this.app.workspace.revealLeaf(leaf);
	}
}
