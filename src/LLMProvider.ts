import { MyPluginSettings } from "./SettingsTab";
import { ChatGroq } from "@langchain/groq";

export class LLMProvider {
	constructor(private readonly settings: MyPluginSettings) {}

	private getLLM() {
		return new ChatGroq({
			modelName: this.settings.defaultModel,
			apiKey: this.settings.apiKey_Groq,
		});
	}

	public async getChatCompletion(messages: string[]) {
		return (await this.getLLM().invoke(messages)).content;
	}
}
