import { requestUrl } from "obsidian";
import { ChatInterface } from "./chat_llm";

export class OpenRouterModel extends ChatInterface {

	async generate(prompt: string): Promise<string> {
		const message = await requestUrl({
			url: "https://openrouter.ai/api/v1/chat/completions",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.apiKey}`,
			},
			method: "POST",
			body: JSON.stringify({
				model: this.modelName,
				max_tokens: +this.maxTokens,
				messages: [
					{
						role: 'user',
						content: prompt
					}
				]
			}),
		});

		const json = await message.json;
		return json.choices[0].message.content;
	}
}
