import { App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main";

/** Horizontal placement of the mind map inside an embedded frame. */
export type ContentAlignment = "left" | "center" | "right";

export interface MindMapSettings {
	h1AsRoot: boolean;
	contentAlignment: ContentAlignment;
}

export const DEFAULT_SETTINGS: MindMapSettings = {
	h1AsRoot: false,
	contentAlignment: "left",
};

export class MindMapSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Use first level 1 heading as root")
			.setDesc(
				"When enabled, uses the first level 1 heading as the root node instead of the filename. Content before the first level 1 heading will be ignored.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.h1AsRoot)
					.onChange(async (value) => {
						this.plugin.settings.h1AsRoot = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Content position in the frame")
			.setDesc(
				"Where to place the mind map inside its frame in embedded code blocks.",
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("left", "Left")
					.addOption("center", "Center")
					.addOption("right", "Right")
					.setValue(this.plugin.settings.contentAlignment)
					.onChange(async (value) => {
						this.plugin.settings.contentAlignment =
							value as ContentAlignment;
						await this.plugin.saveSettings();
						this.plugin.refreshEmbeddedMindmaps();
					}),
			);
	}
}
