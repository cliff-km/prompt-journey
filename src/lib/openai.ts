import { Configuration, OpenAIApi } from "openai";

export function createOpenAI(apiKey) {
    const configuration = new Configuration({
        apiKey
    });

    const openai = new OpenAIApi(configuration);
    return openai;
}

export async function createCompletion(openai, prompt) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        temperature: 0,
        max_tokens: 7,
    });

    return response
}

export async function createChatCompletion(openai, prompt) {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-0301",
        prompt,
        temperature: 0,
        max_tokens: 7,
    });

    return response
}