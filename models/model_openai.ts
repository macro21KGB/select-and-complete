import { ChatInterface } from "./chat_llm";
import { requestUrl } from "obsidian";

export class OpenAIModel extends ChatInterface {

	async generate(prompt: string): Promise<string> {
		const message = await requestUrl({
			url: "https://api.openai.com/v1/chat/completions",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				model: this.modelName,
				max_completion_tokens: +this.maxTokens,
				temperature: 0.5,
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

		return message.choices[0].message.content
	}

}
