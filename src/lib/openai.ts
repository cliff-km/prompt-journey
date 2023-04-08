import type { MultiPrompt } from "../types";
import { Configuration, OpenAIApi } from "openai";

export function createOpenAI(apiKey: string) {
    const configuration = new Configuration({
        apiKey
    });

    const openai = new OpenAIApi(configuration);
    return openai;
}

export async function createCompletion(openai: OpenAIApi, prompt: string, model = "text-davinci-003") {
    const response = await openai.createCompletion({
        model,
        prompt,
        temperature: 0.8,
        max_tokens: 250,
    });

    return response
}

export async function createChatCompletion(openai: OpenAIApi, prompt: string, model = "gpt-3.5-turbo") {
    const response = await openai.createChatCompletion({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 250,
    });

    return response
}

export async function createEmbedding(openai: OpenAIApi, prompt: string, model = "text-embedding-ada-002") {
    const response = await openai.createEmbedding({
        model,
        input: prompt
    });

    return response
}

export async function listModels(openai: OpenAIApi) {
    const response = await openai.listModels();
    return response;
}