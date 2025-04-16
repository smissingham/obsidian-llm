import { App, ItemView, WorkspaceLeaf } from "obsidian";
import {
	createContext,
	StrictMode,
	useContext,
	useState,
	useRef,
	useEffect,
} from "react";
import { Root, createRoot } from "react-dom/client";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

import MyPlugin from "../main";
import { LLMProvider } from "src/LLMProvider";

export const VIEW_TYPE_EXAMPLE = "obsidian-llm-chat";

interface PluginContextType {
	app: App;
	plugin: MyPlugin;
}

export const PluginContext = createContext<PluginContextType | undefined>(
	undefined
);

interface ChatMessage {
	role: string;
	content: string;
}

export class ChatView extends ItemView {
	root: Root | null = null;
	plugin: MyPlugin;
	lastResponse: string = "";

	constructor(leaf: WorkspaceLeaf, plugin: MyPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Obsidian LLM";
	}

	getIcon() {
		return "message-square-dot";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.renderView();
	}

	private renderView() {
		this.root?.render(
			<StrictMode>
				<PluginContext.Provider
					value={{ app: this.app, plugin: this.plugin }}
				>
					<ChatInterface />
				</PluginContext.Provider>
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}

function ChatInterface() {
	const context = useContext(PluginContext);
	if (!context) return null;

	const { app, plugin } = context;
	const [message, setMessage] = useState("");
	const [chatHistory, setChatHistory] = useState<BaseMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [shouldFocus, setShouldFocus] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const [llm, setLLM] = useState(
		new ChatGroq({
			modelName: plugin.settings.defaultModel,
			apiKey: plugin.settings.apiKey_Groq,
		})
	);

	useEffect(() => {
		if (shouldFocus && inputRef.current) {
			inputRef.current.focus();
			setShouldFocus(false);
		}
	}, [shouldFocus]);

	const handleSendMessage = () => {
		if (!message.trim() || isLoading) return;
		const currentMessage = message;
		setMessage("");
		setShouldFocus(true);
		onSendMessage(currentMessage);
	};

	const onSendMessage = async (message: string) => {
		if (!message.trim()) return;

		const userMessage = new HumanMessage(message);
		setChatHistory((prev) => [...prev, userMessage]);
		setIsLoading(true);

		try {
			const response = await llm.invoke([...chatHistory, userMessage]);
			const llmMessage = new AIMessage(response.content.toString());
			setChatHistory((prev) => [...prev, llmMessage]);
		} catch (error) {
			console.error("Error getting LLM response:", error);
			setChatHistory((prev) => [
				...prev,
				new AIMessage(
					"Sorry, I encountered an error processing your request."
				),
			]);
		} finally {
			setIsLoading(false);
			setShouldFocus(true);
		}
	};

	return (
		<div className="flex flex-col h-full">
			<h1>Obsidian LLM Chat</h1>

			<div className="flex">
				<p className="font-bold">{plugin.settings.defaultProvider}</p>
				<p>:&nbsp;</p>
				<p className="italic">{plugin.settings.defaultModel}</p>
			</div>

			<div className="flex flex-col gap-2 overflow-y-auto flex-grow p-2">
				{chatHistory.map((message, index) => (
					<div
						key={index}
						className={`p-3 rounded-xl max-w-10/12 border border-opacity-10 ${
							message instanceof HumanMessage
								? "user-message self-end rounded-br-none bg-[var(--background-primary)] bg-opacity-10"
								: "ai-message self-start rounded-bl-none bg-[var(--background-secondary)] bg-opacity-15"
						}`}
					>
						<p
							className={`text-sm ${
								message instanceof HumanMessage
									? "text-[var(--text-primary)]"
									: "text-[var(--text-secondary)]"
							}`}
						>
							{message.content.toString()}
						</p>
					</div>
				))}

				{isLoading && (
					<div className="ai-message self-start rounded-bl-none bg-[var(--background-secondary)] bg-opacity-15">
						<p className="text-sm">Thinking...</p>
					</div>
				)}
			</div>

			<div
				className="flex mt-auto py-2 px-0 border-t"
				onKeyDown={(e) => {
					if (e.key === "Enter" && !isLoading && message.trim()) {
						handleSendMessage();
					}
				}}
			>
				<input
					ref={inputRef}
					type="text"
					placeholder="Message"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="flex-grow rounded-l-lg border mx-2 text-[var(--text-primary)] bg-[var(--background-primary)] bg-opacity-10"
					disabled={isLoading}
				/>
				<button
					onClick={handleSendMessage}
					className={`btn rounded-r-lg self-end text-[var(--text-on-accent)] ${
						isLoading ? "disabled" : ""
					}`}
					disabled={isLoading || !message.trim()}
				>
					Send
				</button>
			</div>
		</div>
	);
}
