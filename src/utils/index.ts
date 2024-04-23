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

export const MODELS = {
	'GPT-3.5 Turbo': 'gpt-3.5-turbo',
	'GPT-4': 'gpt-4',
	'GPT-4 Turbo': 'gpt-4-turbo',
	'Claude 3 Haiku': 'claude-3-haiku-20240307',
	'Claude 3 Sonnet': 'claude-3-sonnet-20240229',
	'Claude 3 Opus': 'claude-3-opus-20240229',
} as const;


const modelType = {
	"Anthropic": "anthropic",
	"OpenAI": "openai",
	"Mistral": "mistral"
} as const
export type ModelType = keyof typeof modelType;
