
export const getKeyNameBasedOnModel = (model: string) => {
	if (model.toLowerCase().startsWith("gpt")) return "openaiKey";

	if (model.toLowerCase().startsWith("claude")) return "antrhopicKey";

	return "openaiKey"
}

