<script lang="ts">
    import { isUndefined } from "mathjs";
    import {
        activePromptStore,
        activePrompt,
    } from "../stores/activePromptStore.js";
    import { findBoxCenter } from "../lib/vector";
    import EmbedControllerWidget from "./EmbedControllerWidget.svelte";
    import { createOpenAI, createEmbedding } from "../lib/openai.js";
    import { preferredEmbeddingModel } from "../stores/preferredEmbeddingModelStore";
    import { key } from "../stores/keyStore.js";
    import { afterUpdate, beforeUpdate, onMount } from "svelte";
    import TSNE from "tsne-js";

    let controllerW = 0;
    let controllerH = 0;
    $: promptCount = Object.keys($activePrompt.weightedPrompts || {}).length;
    $: promptLimit = $activePrompt.embedPromptLimit || promptCount;
    let embedPromise = null;
    let inProgressEmbeds = {};

    $: wh = [controllerW || 250, controllerH || 250];
    $: center = findBoxCenter(wh);

    $: {
        if ($key && embeddingsRequireUpdate($activePrompt)) {
            embedPromise = fetchEmbeddings();
        }
    }

    function updateEmbedPromptLimit(e) {
        if(e.target.value > 0 && e.target.value <= promptCount)
        activePromptStore.updateActivePrompt({
            ...$activePrompt,
            embedPromptLimit: e.target.value
        });
    }
    function updateExponentialScaling(e) {
        activePromptStore.updateActivePrompt({
            ...$activePrompt,
            embedExponentialScaling: !$activePrompt.embedExponentialScaling
        });
    }

    function updateWeightScaling(e) {
        activePromptStore.updateActivePrompt({
            ...$activePrompt,
            embedWeightScaling: e.target.value
        });
    }

    function get2DEmbeddings(embeddings) {
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

    async function shuffleEmbeddinMap() {
        activePromptStore.updateActivePrompt({
            ...$activePrompt,
            scaledEmbedMappings: get2DEmbeddings($activePrompt.embeddings),
        });
    }

    async function fetchEmbeddings() {
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

        activePromptStore.updateActivePrompt({
            ...$activePrompt,
            embeddings: inProgressEmbeds,
            lastEmbeddingChange: Date.now(),
            scaledEmbedMappings: get2DEmbeddings(inProgressEmbeds),
        });
    }

    function embeddingsRequireUpdate(activePrompt) {
        if (!activePrompt.embeddings) return true;
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

    beforeUpdate(() => {
        console.log($activePrompt.embedPromptLimit, promptCount)
    });
    afterUpdate(() => {
        console.log($activePrompt.embedPromptLimit, promptCount)
    });

    onMount(() => {
        console.log($activePrompt.embedPromptLimit, promptCount)
        if ($key && embeddingsRequireUpdate($activePrompt)) {
            embedPromise = fetchEmbeddings();
        }
    });
</script>
{#if !$key}
    <div class="w-full h-full flex justify-center">
        <div class="flex flex-col justify-center">
            <div class="h-20 w-52">
                <p class="text-center text-lg">Set OpenAI key in settings to use embedding map.</p>
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
                    class="toggle"
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
                        class="range"
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
                    class="range"
                />
            </div>
            <div class="w-32 px-2 pb-1 flex flex-col justify-end">
                <button on:click={shuffleEmbeddinMap} class="btn btn-sm btn-primary"
                    >Shuffle</button
                >
            </div>
        </div>
    {:catch error}
        <p style="color: red">{error.message}</p>
    {/await}
{/if}