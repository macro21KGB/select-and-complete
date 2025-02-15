import { ChatInterface } from "./chat_llm";
import { requestUrl } from "obsidian";

export class OpenAIModel extends ChatInterface {

	async generate(prompt: string): Promise<string> {
		const requestBody: any = {
			model: this.modelName,
			response_format: {
				type: "text"
			},
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: prompt
						}
					]
				}
			]
		};

		if (this.modelName.includes("gpt")) {
			requestBody.max_completion_tokens = +this.maxTokens;
			requestBody.temperature = 0.5
		}

		const message = await requestUrl({
			url: "https://api.openai.com/v1/chat/completions",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify(requestBody),
			method: "POST"

		}).catch((error) => {
			console.error(error);
			return error;
		});

		return message.json.choices[0].message.content
	}

}
