<script lang="ts">
    import type { Concepts, Embeddings, MultiPrompt } from "../types";
    import { activePrompt } from "../stores/activePrompt";
    import EmbedControllerWidget from "./EmbedControllerWidget.svelte";
    import { key } from "../stores/key";
    import { activeEmbeddings } from "../stores/activeEmbeddings";
    import { concepts } from "../stores/concepts";
    import { embedQueue } from "../stores/embedQueue";
    import { get2DEmbeddings, getKMeansClusters } from "../lib/embedMap";
    import PromptBox from "../prompts/PromptBox.svelte";

    let embedPromise = null;
    let inProgressEmbeds = {} as Concepts;

    $: {
        if ($key && embeddingsRequireUpdate($activePrompt, $activeEmbeddings)) {
            console.log("Embeddings require update");
            fetchEmbeddings();
        }
    }

    async function getStoredEmbeddings(
        promptText: string[]
    ): Promise<Concepts> {
        console.log("waiting for embeddings");

        return new Promise((resolve, reject) => {
            inProgressEmbeds = {} as Concepts;

            const checkForEmbedding = () => {
                fetchEmbeddings();

                //check if inProgressEmbeds has all the embeddings
                const allEmbeddingsFetched = promptText.every((text) => {
                    return inProgressEmbeds[text] !== undefined;
                });

                if (allEmbeddingsFetched) {
                    resolve(inProgressEmbeds);
                } else {
                    setTimeout(checkForEmbedding, 100);
                }
            };

            const fetchEmbeddings = () => {
                promptText.forEach((text) => {
                    const embedding = concepts.get()[text];
                    if (embedding) {
                        inProgressEmbeds[text] = embedding;
                    }
                });
            };

            fetchEmbeddings();

            //queue up missing embeddings
            const missingEmbeddings = promptText.filter((text) => {
                return !inProgressEmbeds[text];
            });

            missingEmbeddings.forEach((text) => {
                embedQueue.update((q) => {
                    q[text] = false;
                    return q;
                });
            });

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

        const promptText = prompts.map((p) => p[1]);

        console.log("fetching embedding for", promptText);
        embedPromise = getStoredEmbeddings(promptText);
        await embedPromise;

        const indexedEmbeds = {} as Embeddings;
        prompts.forEach(([id, text]) => {
            indexedEmbeds[parseInt(id)] = inProgressEmbeds[text];
        });

        let orderedEmbeds = Object.entries(indexedEmbeds).sort(
            (a, b) => parseInt(a[0]) - parseInt(b[0])
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
            scaledEmbedMappings: get2DEmbeddings(indexedEmbeds),
        });

        activeEmbeddings.set(indexedEmbeds);

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
                    <p class="text-center text-sm">
                        Fetching embeddings. This may take a while...
                    </p>
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
<PromptBox />
