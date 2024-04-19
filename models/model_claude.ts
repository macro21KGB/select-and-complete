import { ChatInterface } from "./chat_llm";
import { requestUrl } from "obsidian";

export class ClaudeModel extends ChatInterface {

	async generate(prompt: string): Promise<string> {
		const message = await requestUrl({
			url: "https://api.anthropic.com/v1/messages",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": this.apiKey,
				"anthropic-version": "2023-06-01"
			},
			body: JSON.stringify({
				model: this.modelName,
				max_tokens: +this.maxTokens,
				messages: [
					{
						role: "user",
						content: prompt
					}
				]
			}),
			method: "POST"

		}).catch((error) => {
			console.error(error);
			return error;
		});

		return message.json.content[0].text
	}

}
