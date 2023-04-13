<script lang="ts">
    import type { Embeddings, MultiPrompt } from "../types";
    import { activePrompt } from "../stores/activePrompt";
    import EmbedControllerWidget from "./EmbedControllerWidget.svelte";
    import { key } from "../stores/key";
    import { activeEmbeddings } from "../stores/activeEmbeddings";
    import { concepts } from "../stores/concepts";
    import { get2DEmbeddings, getKMeansClusters } from "../lib/embedMap";

    let embedPromise = null;
    let inProgressEmbeds = {} as Embeddings;


    $: {
        if ($key && embeddingsRequireUpdate($activePrompt, $activeEmbeddings)) {
            console.log("Embeddings require update");
            embedPromise = fetchEmbeddings();
        }
    }

    async function getStoredEmbedding(text: string) {
        console.log("waiting for embedding for", text);

        return new Promise((resolve, reject) => {
            const checkForEmbedding = () => {
                const embeddingFromConcept = concepts.get()[text];
                console.log("embeddingFromConcept", embeddingFromConcept);
                if (embeddingFromConcept) {
                    resolve(embeddingFromConcept);
                } else if (embeddingFromConcept === null) {
                    setTimeout(checkForEmbedding, 500);
                } else if (embeddingFromConcept === undefined) {
                    console.log("setting embedding to null for", text);
                    concepts.update(text, null);
                    setTimeout(checkForEmbedding, 5000);
                } else {
                    console.log(
                        "not found embedding for",
                        text,
                        embeddingFromConcept
                    );
                    reject(embeddingFromConcept);
                }
            };

            checkForEmbedding();
        });
    }

    async function fetchEmbeddings() {
        console.log("fetching embeddings");
        if (!$key) return;
        if (!$activePrompt.weightedPrompts) return;

        const prompts = Object.entries($activePrompt.weightedPrompts).map(
            ([id, prompt]) => [id, prompt.text]
        );

        inProgressEmbeds = {} as Embeddings;
        for (let p of prompts) {
            console.log("fetching embedding for", p[1]);
            const response = await getStoredEmbedding(p[1]);
            inProgressEmbeds[p[0]] = response;
        }

        let orderedEmbeds = Object.entries(inProgressEmbeds).sort(
            (a, b) => a[0] - b[0]
        );

        const padArray = (n: number) => new Array(n).fill(null).map(() => []);

        console.log("clustering embeddings");
        const set2 =
            orderedEmbeds.length >= 2
                ? getKMeansClusters(
                      orderedEmbeds.map((e) => e[1]),
                      2
                  )
                : [orderedEmbeds.map((e) => e[0])];
        console.log("set of 2 complete");
        const set4 =
            orderedEmbeds.length >= 4
                ? getKMeansClusters(
                      orderedEmbeds.map((e) => e[1]),
                      4
                  )
                : set2;
        console.log("set of 4 complete");
        const set6 =
            orderedEmbeds.length >= 6
                ? getKMeansClusters(
                      orderedEmbeds.map((e) => e[1]),
                      6
                  )
                : set4;
        console.log("set of 6 complete");
        const set8 =
            orderedEmbeds.length >= 8
                ? getKMeansClusters(
                      orderedEmbeds.map((e) => e[1]),
                      8
                  )
                : set6;
        console.log("set of 8 complete");

        activePrompt.update({
            ...$activePrompt,
            embedClusterSets: {
                2: [...set2, ...padArray(2 - set2.length)],
                4: [...set4, ...padArray(4 - set4.length)],
                6: [...set6, ...padArray(6 - set6.length)],
                8: [...set8, ...padArray(8 - set8.length)],
            },
            lastEmbeddingChange: Date.now(),
            scaledEmbedMappings: get2DEmbeddings(inProgressEmbeds),
        });

        activeEmbeddings.set(inProgressEmbeds);

        console.log("embeddings complete");
    }

    function embeddingsRequireUpdate(
        activePrompt: MultiPrompt,
        activeEmbeddings: Embeddings
    ) {
        if (!activeEmbeddings) {
            console.log("no active embeddings");
            return true;
        }
        if (!activePrompt.embedClusterSets) {
            console.log("no active cluster sets");
            return true;
        }
        if (
            Object.entries(activeEmbeddings).length !==
            Object.entries(activePrompt.weightedPrompts).length
        ) {
            console.log(
                "embeddings length mismatch",
                Object.entries(activeEmbeddings).length,
                Object.entries(activePrompt.weightedPrompts).length
            );
            return true;
        }
        if (
            (activePrompt.lastPromptChange || 0) >
            (activePrompt.lastEmbeddingChange || 0)
        ) {
            console.log("prompt change after embedding change");
            return true;
        }
        return false;
    }
</script>

{#if !$key}
    <div class="w-full h-full flex justify-center">
        <div class="flex flex-col justify-center">
            <div class="h-20 w-52">
                <p class="text-center text-lg">
                    Set OpenAI key in settings to use embedding map.
                </p>
            </div>
        </div>
    </div>
{:else}
    {#await embedPromise}
        <div class="w-full h-full flex justify-center">
            <div class="flex flex-col justify-center">
                <div class="h-20 w-52">
                    <progress
                        class="progress progress-primary w-56"
                        value={Object.keys(inProgressEmbeds).length}
                        max={Object.keys($activePrompt.weightedPrompts).length}
                    />
                </div>
            </div>
        </div>
    {:then response}
        <EmbedControllerWidget />
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
{/if}
