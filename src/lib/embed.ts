import { createOpenAI, createEmbedding } from "./openai.js";
import { preferredEmbeddingModelStore } from "../stores/preferredEmbeddingModelStore";
import { keyStore } from "../stores/keyStore";

export async function embedString(c: string) {
    const openai = createOpenAI(keyStore.get());
    const response = await createEmbedding(
        openai,
        c,
        preferredEmbeddingModelStore.get() || "text-embedding-ada-002"
    );
    return response.data.data[0].embedding;
}