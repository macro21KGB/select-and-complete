export interface AnthropicApiResponse {
	id: string;
	content: Content[];
	model: string;
	stop_reason: string;
	stop_sequence: string;
	usage: Usage;
}

interface Usage {
	input_tokens: number;
	output_tokens: number;
}

interface Content {
	text?: string;
	id?: string;
	name?: string;
	input?: Input;
}

interface Input {
}
