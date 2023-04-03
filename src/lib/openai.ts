import { Configuration, OpenAIApi } from "openai";

export function createOpenAI(apiKey) {
    const configuration = new Configuration({
        apiKey
    });

    const openai = new OpenAIApi(configuration);
    return openai;
}

export async function createCompletion(openai, model, prompt) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        temperature: 0.8,
        max_tokens: 250,
    });

    return response
}

export async function createChatCompletion(openai, model, prompt) {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 250,
    });

    return response
}

export async function listModels(openai) {
    const response = await openai.listModels();
    return response;
}