type ChatInterfaceOptions = {
	apiKey: string,
	maxTokens: number,
	modelName: string
}

export class ChatInterface {

	apiKey: string;
	modelName: string;
	maxTokens: number

	constructor({ modelName, apiKey, maxTokens }: ChatInterfaceOptions) {
		this.apiKey = apiKey
		this.modelName = modelName
		this.maxTokens = maxTokens
	}

	async generate(prompt: string): Promise<string> {
		return '';
	}
}


export class ChatExecutor {
	private model: ChatInterface;

	constructor(model: ChatInterface) {
		this.model = model;
	}

	async generate(prompt: string): Promise<string> {
		return this.model.generate(prompt);
	}
}
