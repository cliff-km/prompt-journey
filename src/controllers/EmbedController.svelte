<script lang="ts">
    import type { Vec2, Embeddings } from "../types.js";
    import TSNE from "tsne-js";
    import * as clustering from "density-clustering";
    import { activePrompt } from "../stores/activePrompt.js";
    import { findBoxCenter } from "../lib/vector";
    import EmbedControllerWidget from "./EmbedControllerWidget.svelte";
    import { createOpenAI, createEmbedding } from "../lib/openai.js";
    import { preferredEmbeddingModel } from "../stores/preferredEmbeddingModel.js";
    import { key } from "../stores/key.js";

    let controllerW = 0;
    let controllerH = 0;
    $: promptCount = Object.keys($activePrompt.weightedPrompts || {}).length;
    $: promptLimit = $activePrompt.embedPromptLimit || promptCount;
    let embedPromise = null;
    let inProgressEmbeds = {};

    $: wh = [controllerW || 250, controllerH || 250] as Vec2;
    $: center = findBoxCenter(wh);

    function getHighestClusterAvailable(embedCount: number) {
        if (embedCount < 2) return 0;
        if (embedCount < 4) return 2;
        if (embedCount < 6) return 4;
        if (embedCount < 8) return 6;
        return 8;
    }

    $: {
        $activePrompt.embeddings &&
            Object.keys($activePrompt.embeddings).length <
                $activePrompt.embedClusters &&
            updateClusterCount(
                getHighestClusterAvailable(
                    Object.keys($activePrompt.embeddings).length
                )
            );
    }

    $: {
        if ($key && embeddingsRequireUpdate($activePrompt)) {
            embedPromise = fetchEmbeddings();
        }
    }

    function updateEmbedPromptLimit(e: InputEvent) {
        const { target } = e;
        if (!target) return;

        const t = target as HTMLInputElement;
        if (!t.value) return;

        const value = parseInt(t.value);

        if (value > 0 && value <= promptCount)
            activePrompt.update({
                ...$activePrompt,
                embedPromptLimit: value,
            });
    }

    function updateExponentialScaling() {
        activePrompt.update({
            ...$activePrompt,
            embedExponentialScaling: !$activePrompt.embedExponentialScaling,
        });
    }

    function updateWeightScaling(e: InputEvent) {
        const { target } = e;
        if (!target) return;

        const t = target as HTMLInputElement;
        if (!t.value) return;

        const value = parseInt(t.value);

        activePrompt.update({
            ...$activePrompt,
            embedWeightScaling: value,
        });
    }

    function updateClusterCount(count: number) {
        if ([0, 2, 4, 6, 8].indexOf(count) === -1) return;

        activePrompt.update({
            ...$activePrompt,
            embedClusters: count,
        });
    }

    function get2DEmbeddings(embeddings: Embeddings) {
        let model = new TSNE({
            dim: 2,
            perplexity: 30.0,
            earlyExaggeration: 4.0,
            learningRate: 100.0,
            nIter: 5000,
            metric: "euclidean",
        });

        // inputData is a nested array which can be converted into an ndarray
        // alternatively, it can be an array of coordinates (second argument should be specified as 'sparse')

        const ids = Object.keys(embeddings);
        const data = Object.values(embeddings);

        model.init({
            data,
            type: "dense",
        });

        // `error`,  `iter`: final error and iteration number
        // note: computation-heavy action happens here
        let [error, iter] = model.run();

        // `outputScaled` is `output` scaled to a range of [-1, 1]
        let outputScaled = model.getOutputScaled();

        // adjust to [0, 1]
        let unitScaled = outputScaled.map(([x, y]) => [
            (x + 1) / 2,
            (y + 1) / 2,
        ]);

        let unitScaledById = ids.reduce((acc, id, idx) => {
            acc[id] = unitScaled[idx];
            return acc;
        }, {});

        return unitScaledById;
    }

    function getKMeansClusters(embeddings, k: number) {
        const kmeans = new clustering.KMEANS();
        const clusters = kmeans.run(embeddings, k);
        return clusters;
    }

    async function shuffleEmbeddinMap() {
        activePrompt.update({
            ...$activePrompt,
            scaledEmbedMappings: get2DEmbeddings($activePrompt.embeddings),
        });
    }

    async function fetchEmbeddings() {
        console.log("fetching embeddings");
        if (!$key) return;
        if (!$activePrompt.weightedPrompts) return;

        const prompts = Object.entries($activePrompt.weightedPrompts).map(
            ([id, prompt]) => [id, prompt.text]
        );

        const openai = createOpenAI($key);
        inProgressEmbeds = {};
        for (let p of prompts) {
            const response = await createEmbedding(
                openai,
                p[1],
                $preferredEmbeddingModel
            );
            inProgressEmbeds[p[0]] = response.data.data[0].embedding;
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
            embeddings: inProgressEmbeds,
            embedClusterSets: {
                2: [...set2, ...padArray(2 - set2.length)],
                4: [...set4, ...padArray(4 - set4.length)],
                6: [...set6, ...padArray(6 - set6.length)],
                8: [...set8, ...padArray(8 - set8.length)],
            },
            lastEmbeddingChange: Date.now(),
            scaledEmbedMappings: get2DEmbeddings(inProgressEmbeds),
        });

        console.log("embeddings complete");
    }

    function embeddingsRequireUpdate(activePrompt) {
        if (!activePrompt.embeddings) return true;
        if (!activePrompt.embedClusterSets) return true;
        if (
            Object.entries(activePrompt.embeddings).length !==
            Object.entries(activePrompt.weightedPrompts).length
        )
            return true;
        if (
            (activePrompt.lastPromptChange || 0) >
            (activePrompt.lastEmbeddingChange || 0)
        )
            return true;
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
        <div
            class="w-full h-full"
            bind:clientWidth={controllerW}
            bind:clientHeight={controllerH}
        >
            <EmbedControllerWidget dimensions={wh} {center} />
        </div>
        <div class="px-2 py-4 pb-0 flex">
            <div class="min-w-max px-2">
                <label class="label">
                    <span class="label-text">Exponential Scaling</span>
                </label>
                <input
                    on:change={updateExponentialScaling}
                    type="checkbox"
                    class="toggle toggle-sm"
                    checked={$activePrompt.embedExponentialScaling}
                />
            </div>
            {#if $activePrompt.embedExponentialScaling}
                <div class="w-full px-2">
                    <label class="label">
                        <span class="label-text">Scaling Power</span>
                    </label>
                    <input
                        on:change={updateWeightScaling}
                        value={$activePrompt.embedWeightScaling}
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        class="range range-sm"
                    />
                </div>
            {/if}
            <div class="w-full px-2">
                <label class="label">
                    <span class="label-text"># Prompts</span>
                </label>
                <input
                    on:change={updateEmbedPromptLimit}
                    value={promptLimit}
                    type="range"
                    min="1"
                    max={promptCount}
                    step="1"
                    class="range range-sm"
                />
            </div>
            <div class="">
                <div class="">
                    <label class="label pb-1 m-0">
                        <span class="label-text">Clusters</span>
                    </label>
                    <div class="btn-group btn-group-horizontal p-0">
                        <button
                            class={($activePrompt.embedClusters || 0) === 0
                                ? "btn btn-xs btn-active"
                                : "btn btn-xs"}
                            on:click={() => updateClusterCount(0)}
                        >
                            0
                        </button>
                        <button
                            class="btn btn-xs"
                            class:btn-active={$activePrompt.embedClusters === 2}
                            class:btn-disabled={Object.keys(
                                $activePrompt.embeddings
                            ).length < 2}
                            on:click={() => updateClusterCount(2)}
                        >
                            2
                        </button>
                        <button
                            class="btn btn-xs"
                            class:btn-active={$activePrompt.embedClusters === 4}
                            class:btn-disabled={Object.keys(
                                $activePrompt.embeddings
                            ).length < 4}
                            on:click={() => updateClusterCount(4)}
                        >
                            4
                        </button>
                        <button
                            class="btn btn-xs"
                            class:btn-active={$activePrompt.embedClusters === 6}
                            class:btn-disabled={Object.keys(
                                $activePrompt.embeddings
                            ).length < 6}
                            on:click={() => updateClusterCount(6)}
                        >
                            6
                        </button>
                        <button
                            class="btn btn-xs"
                            class:btn-active={$activePrompt.embedClusters === 8}
                            class:btn-disabled={Object.keys(
                                $activePrompt.embeddings
                            ).length < 8}
                            on:click={() => updateClusterCount(8)}
                        >
                            8
                        </button>
                    </div>
                </div>
            </div>
            <div class="w-32 px-2 pb-1 flex flex-col justify-end">
                <button
                    on:click={shuffleEmbeddinMap}
                    class="btn btn-xs btn-primary">Shuffle</button
                >
            </div>
        </div>
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
{/if}
