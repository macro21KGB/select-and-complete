import { PluginSettingTab, App, Setting, Notice, Modal } from "obsidian";
import { Filler } from "src/interfaces/filler";
import SelectAndCompletePlugin from "src/main";
import { MODELS } from "src/utils";
import { FillerModal } from "./FillerModal";

type ModelDisplayName = keyof typeof MODELS;
type ModelName = typeof MODELS[ModelDisplayName];


export class MySettingTab extends PluginSettingTab {
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
				Object.keys(MODELS).forEach((displayModelName: ModelDisplayName) => {
					dropdown.addOption(MODELS[displayModelName], displayModelName);
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
				li.style.display = "flex";
				li.style.justifyContent = "space-between";
				li.style.alignItems = "center";
				li.style.flexDirection = "row";
				li.style.marginBottom = "10px";

				const container = li.createDiv();
				container.createEl("div", { text: filler.name });
				container.createEl("small", { text: filler.content });

				const buttons = li.createDiv();
				buttons.style.display = "flex";
				buttons.style.gap = "0.5rem";
				buttons.createEl("button", { text: "Edit" }).addEventListener("click", () => {
					const modifyModal = new Modal(this.app)

					const { contentEl } = modifyModal;


					new Setting(contentEl)
						.setName('Filler name')
						.setClass('pt-2')
						.addText(text => text
							.setValue(filler.name)
							.onChange(async (value) => {
								filler.name = value;
								this.display();
							}));

					new Setting(contentEl)
						.setName('Filler content')
						.addTextArea(text => text
							.setValue(filler.content)
							.onChange(async (value) => {
								filler.content = value;
								this.display();
							})
						);


					modifyModal.open();


				});
				buttons.createEl("button", { text: "Delete" }).addEventListener("click", () => {
					const index = this.plugin.settings.fillers.findIndex((f: Filler) => f.name === filler.name);
					this.plugin.settings.fillers.splice(index, 1);
					this.plugin.saveSettings();
					this.display();
				});
			});
	}
}
