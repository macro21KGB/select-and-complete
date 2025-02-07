import { Editor } from "obsidian";
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

export const getKeyNameBasedOnModel = (model: string) => {
	const modelName = model.toLowerCase()

	if (modelName.includes("/")) return "openRouterKey"

	if (modelName.startsWith("gpt") || modelName.startsWith("o1")) return "openaiKey";

	if (modelName.startsWith("claude")) return "antrhopicKey";

	return "openRouterKey"
}


export const MODELS = {
	'GPT-3.5 Turbo': 'gpt-3.5-turbo',
	'GPT-4': 'gpt-4',
	'GPT-4o': 'gpt-4o',
	'GPT-4o mini': 'gpt-4o-mini',
	'GPT-4 Turbo': 'gpt-4-turbo', 'o1 preview': 'o1-preview',
	'o1 mini': 'o1-mini',
	'Claude 3 Haiku': 'claude-3-haiku-20240307',
	'Claude 3.5 Haiku': 'claude-3-5-haiku-20241022',
	'Claude 3.5 Sonnet': 'claude-3-5-sonnet-20241022',
	'Claude 3 Sonnet': 'claude-3-sonnet-20240229',
	'Claude 3 Opus': 'claude-3-opus-20240229',
	'Gemini 2.0 Flash (OpenRouter)': 'google/gemini-2.0-flash-001'
} as const;


const modelType = {
	"Anthropic": "anthropic",
	"OpenAI": "openai",
	"Ollama": "ollama",
	"OpenRouter": "openrouter"
} as const
export type ModelType = keyof typeof modelType;
