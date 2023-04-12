import { createOpenAI, createEmbedding } from "./openai.js";
import { preferredEmbeddingModel } from "../stores/preferredEmbeddingModel.js";
import { key } from "../stores/key.js";

export async function embedString(c: string) {
    const openai = createOpenAI(key.get());
    const response = await createEmbedding(
        openai,
        c,
        preferredEmbeddingModel.get() || "text-embedding-ada-002"
    );
    return response.data.data[0].embedding;
}