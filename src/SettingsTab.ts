import { App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main";
import { env } from "process";

export interface MyPluginSettings {
	apiKey_LangSmith: string;
	apiKey_OpenAI: string;
	mySetting: string;
	defaultProvider: string;
	apiKey_Groq: string;
	defaultModel: string;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
	defaultProvider: "Groq",
	apiKey_Groq: "",
	defaultModel: "llama-3.1-8b-instant",
	apiKey_LangSmith: "",
	apiKey_OpenAI: "",
};

export class SettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const defaultSettingsArea = containerEl.createEl("div");
		defaultSettingsArea.createEl("h1", { text: "Defaults" });

		new Setting(defaultSettingsArea)
			.setName("Default LLM Provider")
			.setDesc("Select the LLM provider you want to use")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						Groq: "Groq",
						LMStudio: "LMStudio",
					})
					.setValue(this.plugin.settings.defaultProvider)
					.onChange(async (value) => {
						this.plugin.settings.defaultProvider = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(defaultSettingsArea)
			.setName("Default Model Name")
			.setDesc("Enter the model name you want to use")
			.addText((text) =>
				text
					.setPlaceholder("Enter the model name")
					.setValue(this.plugin.settings.defaultModel)
					.onChange(async (value) => {
						this.plugin.settings.defaultModel = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(defaultSettingsArea)
			.setName("LangSmith API Key")
			.setDesc("Enter your LangSmith API key")
			.addText((text) =>
				text
					.setPlaceholder("Enter your LangSmith API key")
					.setValue(this.plugin.settings.apiKey_LangSmith)
					.onChange(async (value) => {
						this.plugin.settings.apiKey_LangSmith = value;
						await this.plugin.saveSettings();
						if (value) {
							// export ENV var
							process.env.LANGSMITH_TRACING = "true";
							process.env.LANGSMITH_API_KEY = value;
							process.env.LANGSMITH_ENDPOINT =
								"https://api.smith.langchain.com";
							process.env.LANGSMITH_PROJECT = "obsidian-llm";
						}
					})
			);

		const providerKeysArea = defaultSettingsArea.createEl("div");
		providerKeysArea.createEl("h1", { text: "LLM Provider Keys" });

		new Setting(providerKeysArea)
			.setName("Groq API Key")
			.setDesc("Enter your Groq API key")
			.addText((text) =>
				text
					.setPlaceholder("Enter your Groq API key")
					.setValue(this.plugin.settings.apiKey_Groq)
					.onChange(async (value) => {
						this.plugin.settings.apiKey_Groq = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(providerKeysArea)
			.setName("OpenAI API Key")
			.setDesc("Enter your OpenAI API key")
			.addText((text) =>
				text
					.setPlaceholder("Enter your OpenAI API key")
					.setValue(this.plugin.settings.apiKey_OpenAI)
					.onChange(async (value) => {
						this.plugin.settings.apiKey_OpenAI = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
