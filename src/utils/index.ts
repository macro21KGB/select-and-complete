import { Editor, Notice } from "obsidian";
import { Filler } from "src/interfaces/filler";

export function getSelectedText(editor: Editor) {

	const textSelection = getSelection();

	let selectedText: string = editor.getLine(editor.getCursor().line);

	if (textSelection !== null && textSelection.toString() !== '')
		selectedText = textSelection.toString();

	return { selectedText, textSelection };
}

export const DUMMY_FILLERS: Filler[] = [
	{
		name: "Filler 1",
		content: "This is the content of filler 1. {{PROMPT}}"
	},

]
