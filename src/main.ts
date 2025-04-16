import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Plugin,
	WorkspaceLeaf,
} from "obsidian";
import {
	ChatView,
	VIEW_TYPE_EXAMPLE as VIEW_TYPE_CHAT,
} from "./views/ChatView";
import { PROJECT_NAME } from "./constants";
import { SettingTab, MyPluginSettings, DEFAULT_SETTINGS } from "./SettingsTab";

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		// user configured settings
		await this.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.registerView(VIEW_TYPE_CHAT, (leaf) => new ChatView(leaf, this));

		// Add a ribbon icon to activate the view
		this.addRibbonIcon("bot", PROJECT_NAME, (evt: MouseEvent) => {
			this.activateView();
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_CHAT);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({
					type: VIEW_TYPE_CHAT,
					active: true,
				});
			}
		}

		// Set the view icon
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}
}
