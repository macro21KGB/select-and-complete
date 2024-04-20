import { ChatExecutor } from 'models/chat_llm';
import { ClaudeModel } from 'models/model_claude';
import { OpenAIModel } from 'models/model_openai';
import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, addIcon, request, requestUrl } from 'obsidian';
import { getKeyNameBasedOnModel } from 'utils';
import { FillerModal } from './components/FillerModal';
import { DUMMY_FILLERS, getSelectedText } from './utils';
import { Filler } from './interfaces/filler';

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

const modelType = {
	"Anthropic": "anthropic",
	"OpenAI": "openai",
	"Mistral": "mistral"
} as const
export type ModelType = keyof typeof modelType;

const models = {
	'GPT-3.5 Turbo': 'gpt-3.5-turbo',
	'GPT-4': 'gpt-4',
	'GPT-4 Turbo': 'gpt-4-turbo',
	'Claude 3 Haiku': 'claude-3-haiku-20240307',
	'Claude 3 Sonnet': 'claude-3-sonnet-20240229',
	'Claude 3 Opus': 'claude-3-opus-20240229',
} as const;

type ModelDisplayName = keyof typeof models;
type ModelName = typeof models[ModelDisplayName];

export default class SelectAndCompletePlugin extends Plugin {
	settings: PluginSettings;

	async completeText() {

		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;

		if (!editor) {
			new Notice('No active editor found');
			return;
		}

		const {
			selectedText,
			textSelection
		} = getSelectedText(editor);

		// SETUP LLM step
		const keyName = getKeyNameBasedOnModel(this.settings.model);
		const apiKey = this.settings[keyName]
		const selectedModel = this.settings.model;


		try {
			new Notice('Generating text...');


			let message: string;

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

			const chatExecutor = new ChatExecutor(claudeModel || openaiModel)

			switch (keyName) {
				case 'openaiKey':
					message = await chatExecutor.generate(selectedText)
					break;
				case 'antrhopicKey':
					message = await chatExecutor.generate(selectedText)
			}

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

	async onload() {
		await this.loadSettings();

		addIcon('complete_ai', `
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
			</svg>
		`)


		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('complete_ai', 'Select and Complete', async (evt: MouseEvent) => {
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

		this.addRibbonIcon('complete_ai', 'Text', async (evt: MouseEvent) => {

			const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;

			if (!editor) {
				new Notice('No active editor found');
				return;
			}

			const {
				selectedText
			} = getSelectedText(editor!);

			new FillerModal([
				{
					name: 'Filler 1',
					content: 'This is the content of filler 1: {{PROMPT}}',
				}
			], selectedText).open();

		});


		this.addSettingTab(new MySettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class MySettingTab extends PluginSettingTab {
	plugin: SelectAndCompletePlugin;

	constructor(app: App, plugin: SelectAndCompletePlugin) {
		super(app, plugin);

		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl).setName("Keys").setDesc("Add your API keys here").setHeading();

		new Setting(containerEl)
			.setName('OpenAI API Key')
			.setDesc('Input your OpenAI API key here.')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.openaiKey)
				.onChange(async (value) => {
					this.plugin.settings.openaiKey = value;
					await this.plugin.saveSettings();
				}))

		new Setting(containerEl)
			.setName('Anthropic API Key')
			.setDesc('Input your Anthropic API key here.')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.antrhopicKey)
				.onChange(async (value) => {
					this.plugin.settings.antrhopicKey = value;
					await this.plugin.saveSettings();
				}))

		new Setting(containerEl).setName("Model").setDesc("Choose the model you want to use").setHeading();

		new Setting(containerEl)
			.setName('Choose your model')
			.addDropdown(dropdown => {
				Object.keys(models).forEach((displayModelName: ModelDisplayName) => {
					dropdown.addOption(models[displayModelName], displayModelName);
				})
				dropdown
					.setValue(this.plugin.settings.model)
					.onChange(async (value: ModelName) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
					});

			});
		// max token output
		new Setting(containerEl)
			.setName('Max tokens')
			.setDesc('The maximum number of tokens (words) to generate')
			.addText(text => text
				.setPlaceholder('600 (default)')
				.setValue(this.plugin.settings.maxTokens)
				.onChange(async (value) => {

					if (isNaN(+value)) {
						new Notice('Max tokens must be a number');
						return;
					}
					this.plugin.settings.maxTokens = value;
					await this.plugin.saveSettings();
				}));

		// FILLERS
		new Setting(containerEl).setName("Fillers").setDesc("Custom templates for all your needs").setHeading();

		const newFillerSetting = new Setting(containerEl)
			.setName('Add Filler')
			.setDesc('Add a new filler, use {{PROMPT}} to indicate where the prompt should be inserted')
			.addTextArea(text => { })
			.addButton(button => button
				.setButtonText('Add')
				.onClick(() => {
					const textArea = newFillerSetting.settingEl.querySelector('textarea');
					const fillerText = textArea?.value;

					if (!fillerText) {
						new Notice('Filler text cannot be empty');
						return;
					}

					this.plugin.settings.fillers.push({
						name: `Filler ${this.plugin.settings.fillers.length + 1}`,
						content: fillerText
					});

					this.plugin.saveSettings();
					this.display();
				}));

		// list all fillers
		const listEl = containerEl.createEl("ul");
		listEl.style.listStyle = "none";
		listEl.style.padding = "0";
		listEl.style.margin = "0";

		this.plugin.settings.fillers
			.forEach((filler: Filler) => {
				const li = listEl.createEl("li");

				// List item styling
				li.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.1)";
				li.style.padding = "10px";
				li.style.borderRadius = "0.5rem";
				li.style.marginBottom = "10px";
				li.createEl("div", { text: filler.name });
				li.createEl("small", { text: filler.content });
			});
	}
}
