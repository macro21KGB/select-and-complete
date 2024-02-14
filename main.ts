import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface PluginSettings {
	openaiKey: string;
	model: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	openaiKey: '',
	model: 'gpt-3.5-turbo'
}


export default class HelloWorldPlugin extends Plugin {
	settings: PluginSettings;

	async completeText() {

		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		if (!editor) {
			new Notice('No active editor founc');
			return;
		}

		const selectedText = getSelection();
		const openaiApiKey = this.settings.openaiKey;
		const selectedModel = this.settings.model;

		if (selectedText == null) {
			new Notice('You must select some text to complete');
			return;
		}

		try {
			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${openaiApiKey}`
				},
				body: JSON.stringify({
					"model": selectedModel,
					"messages": [
						{
							"role": "system",
							"content": "You are a helpful assistant."
						},
						{
							"role": "user",
							"content": selectedText.toString()
						}

					]
				})
			});
			const data = await response.json() as any;
			const message = data.choices[0].message.content;
			editor.replaceSelection(message);
		} catch (error) {
			console.error('Error:', error);
		}
	}

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Select and Complete', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			await this.completeText();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');


		this.addCommand({
			id: 'sc_complete_text',
			name: 'Complete Text',
			callback: async () => {
				await this.completeText();
			}
		});

		this.addSettingTab(new MySettingTab(this.app, this));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class MySettingTab extends PluginSettingTab {
	plugin: HelloWorldPlugin;

	constructor(app: App, plugin: HelloWorldPlugin) {
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

	}
}
