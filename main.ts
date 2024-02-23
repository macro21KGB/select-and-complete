import { App, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, addIcon, requestUrl } from 'obsidian';

// Remember to rename these classes and interfaces!

interface PluginSettings {
	openaiKey: string;
	model: string;
	maxTokens: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	openaiKey: '',
	model: 'gpt-3.5-turbo',
	maxTokens: "600"
}


export default class SelectAndCompletePlugin extends Plugin {
	settings: PluginSettings;

	async completeText() {

		if (this.settings.openaiKey === '') {
			new Notice('You must set your OpenAI API key in the settings');
			return;
		}

		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		if (!editor) {
			new Notice('No active editor found');
			return;
		}

		const textSelection = getSelection();
		const openaiApiKey = this.settings.openaiKey;
		const selectedModel = this.settings.model;

		let selectedText = editor.getLine(editor.getCursor().line);

		if (textSelection !== null && textSelection.toString() !== '')
			selectedText = textSelection.toString();

		try {
			new Notice('Generating text...');
			console.log(selectedText)

			const response = await requestUrl({
				url: 'https://api.openai.com/v1/chat/completions',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${openaiApiKey}`
				},
				body: JSON.stringify({
					"model": selectedModel,
					"max_tokens": +this.settings.maxTokens,
					"messages": [
						{
							"role": "system",
							"content": "You are an helpful assistant. You are helping me writing text."
						},
						{
							"role": "user",
							"content": selectedText
						}
					]
				})

			})

			const data = response.json;
			const message = data.choices[0].message.content;

			// add the message to end of the current line

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
			console.error('Error:', error);
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
			id: 'sc_complete_text',
			name: 'Complete Text',
			callback: async () => {
				await this.completeText();
			}
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

		new Setting(containerEl)
			.setName('OPENAI API Key')
			.setDesc('Input your OpenAI API key here.')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.openaiKey)
				.onChange(async (value) => {
					this.plugin.settings.openaiKey = value;
					await this.plugin.saveSettings();
				}))

		new Setting(containerEl)
			.setName('Choose your model')
			.addDropdown(dropdown => {
				dropdown
					.addOption('gpt-3.5-turbo', 'GPT-3.5 Turbo')
					.addOption('gpt-4', 'GPT-4')
					.addOption('gpt-4-turbo', 'GPT-4 Turbo')
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
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
	}
}
