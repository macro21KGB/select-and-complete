import { Notice, SuggestModal } from "obsidian";
import { Filler } from "src/interfaces/filler";

export class FillerModal extends SuggestModal<Filler> {

	prompt: string
	fillers: Filler[]
	callback: (filler: Filler) => void

	constructor(fillers: Filler[], prompt = "", callback: (filler: Filler) => void) {
		super(app)

		this.prompt = prompt
		this.fillers = fillers
		this.callback = callback
	}

	getSuggestions(query: string): Filler[] | Promise<Filler[]> {
		return this.fillers.filter(elem => {
			return elem.name.toLowerCase().includes(query.toLowerCase())
				||
				elem.content.toLowerCase().includes(query.toLowerCase())
		})
	}
	renderSuggestion(filler: Filler, el: HTMLElement) {
		el.createEl("div", { text: filler.name });
		el.createEl("small", { text: filler.content.replace("{{PROMPT}}", this.prompt) });
	}

	onChooseSuggestion(item: Filler, evt: MouseEvent | KeyboardEvent) {
		this.callback(item)
	}
}
