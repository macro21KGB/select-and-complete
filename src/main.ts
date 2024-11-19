import { ChatExecutor } from 'models/chat_llm';
import { ClaudeModel } from 'models/model_claude';
import { OpenAIModel } from 'models/model_openai';
import { MarkdownView, Notice, Plugin, addIcon } from 'obsidian';
import { FillerModal } from './components/FillerModal';
import { MODELS, getSelectedText, getKeyNameBasedOnModel } from './utils';
import { Filler } from './interfaces/filler';
import { MySettingTab } from './components/SettingsTab';

interface PluginSettings {
	openaiKey: string;
	antrhopicKey: string;
	model: ModelName;
	fillers: Filler[];
	maxTokens: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	openaiKey: '',
	antrhopicKey: '',
	model: 'gpt-3.5-turbo',
	maxTokens: "600",
	fillers: []
}

type ModelDisplayName = keyof typeof MODELS;
type ModelName = typeof MODELS[ModelDisplayName] & string;

export default class SelectAndCompletePlugin extends Plugin {
	settings: PluginSettings;
	chatExecutor: ChatExecutor;


	async completeText(possiblePrefetchedText?: string) {

		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;

		if (!editor) {
			new Notice('No active editor found');
			return;
		}

		const {
			selectedText,
			textSelection
		} = getSelectedText(editor);


		try {
			new Notice('Generating text with ' + this.settings.model);


			const message = await this.chatExecutor.generate(possiblePrefetchedText || selectedText)

			if (!textSelection) {
				editor.replaceRange("\n" + message, {
					line: editor.getCursor().line,
					ch: editor.getLine(editor.getCursor().line).length
				});
			}
			else {
				editor.replaceSelection(textSelection + "\n" + message);
			}

		} catch (error) {
			console.error(error);
			new Notice('Error generating text. Check the console for more information')
		}
	}

	setupLLM() {
		const keyName = getKeyNameBasedOnModel(this.settings.model);
		const apiKey = this.settings[keyName]
		const selectedModel = this.settings.model;

		const claudeModel = new ClaudeModel({
			modelName: selectedModel,
			apiKey,
			maxTokens: +this.settings.maxTokens
		})

		const openaiModel = new OpenAIModel({
			modelName: selectedModel,
			apiKey,
			maxTokens: +this.settings.maxTokens
		});


		switch (keyName) {
			case 'openaiKey':
				this.chatExecutor = new ChatExecutor(openaiModel);
				break;
			case 'antrhopicKey':
				this.chatExecutor = new ChatExecutor(claudeModel);
		}
	}

	openFillerModal() {

		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;

		if (!editor) {
			new Notice('No active editor found');
			return;
		}

		const {
			selectedText
		} = getSelectedText(editor!);

		new FillerModal(this.settings.fillers, selectedText, async (item) => {
			await this.completeText(item.content.replace("{{PROMPT}}", selectedText));
		}).open();
	}

	async onload() {
		await this.loadSettings();

		this.setupLLM();

		addIcon('complete_ai', `
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
			</svg>
		`)


		// Complete text
		this.addRibbonIcon('complete_ai', 'Select and Complete', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			await this.completeText();
		});

		this.addCommand({
			id: 'complete_text',
			name: 'Complete selected text',
			callback: async () => {
				await this.completeText();
			}
		});

		this.addCommand({
			id: "complete_text_with_filler",
			name: "Complete selected text with custom prompt (fillers)",
			callback: async () => {
				this.openFillerModal();
			}
		})

		this.addSettingTab(new MySettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		console.log("LLM")
		this.setupLLM()
	}
}
