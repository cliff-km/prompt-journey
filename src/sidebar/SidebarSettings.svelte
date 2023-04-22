<script lang="ts">
    import { WeightMode } from "../types.js";
    import { key } from "../stores/key.js";
    import { preferredModel } from "../stores/preferredModel.js";
    import { preferredEmbeddingModel } from "../stores/preferredEmbeddingModel.js";
    import { createOpenAI, listModels } from "../lib/openai.js";
    import { activePrompt } from "../stores/activePrompt.js";
    import { cacheSize } from "../stores/cacheSize.js";
    import { concepts } from "../stores/concepts.js";

    const supportedCompletionModels = [
        "text-davinci-003",
        "text-curie-001",
        "text-babage-001",
        "text-ada-001",
        "gpt-3.5-turbo",
        "gpt-3.5-turbo-0301",
    ];

    const supportedEmbeddingModels = ["text-embedding-ada-002"];

    let openaiKey = $key;

    let completionModels = [];
    let embeddingModels = [];
    let selectedCompletionModel = $preferredModel;
    let selectedEmbeddingModel = $preferredEmbeddingModel;
    let listPromise = null;

    async function fetchModels(openaiKey: string) {
        if (!openaiKey || (completionModels.length && embeddingModels.length))
            return;
        const openai = createOpenAI(openaiKey);
        listPromise = listModels(openai);

        const response = await listPromise;
        if (response.data)
            completionModels = response.data.data
                .map(({ id }) => id)
                .filter((id) => supportedCompletionModels.includes(id));
        embeddingModels = response.data.data
            .map(({ id }) => id)
            .filter((id) => supportedEmbeddingModels.includes(id));
    }

    function handleModelSelect(e) {
        selectedCompletionModel = e.target.value;
        preferredModel.update(selectedCompletionModel);
    }

    function handleEmbeddingSelect(e) {
        selectedEmbeddingModel = e.target.value;
        preferredEmbeddingModel.update(selectedEmbeddingModel);
    }

    function handleKeyInput(e) {
        const newKey = e.target.value;
        key.update(newKey);
        if (newKey.length === 51) {
            fetchModels(newKey);
        }
        if (newKey.length === 0) {
            handleKeyClear();
        }
    }

    function handleKeyClear() {
        key.delete();
        openaiKey = "";
        completionModels = [];
        embeddingModels = [];
        if ($activePrompt.weightMode === WeightMode.Embed) {
            activePrompt.update({
                ...$activePrompt,
                weightMode: WeightMode.Circle,
            });
        }
    }

    $: {
        fetchModels(openaiKey);
    }
</script>

<div
    class="h-full p-4 w-full bg-base-100 overflow-y-auto text-base-content inline-block"
>
    <div class="flex justify-center">
        <div class="form-control w-full max-w-xs">
            <label class="label">
                <span class="label-text-alt">Open AI Key</span>
            </label>
            <input
                value={$key}
                on:input={handleKeyInput}
                type="password"
                placeholder="Open AI Key"
                class="input input-bordered w-full max-w-xs"
            />
            <label class="label">
                <button on:click={handleKeyClear} class="btn btn-xs btn-error"
                    >Clear</button
                >
            </label>
        </div>
    </div>
    {#await listPromise}
        <div class="py-10 flex justify-center">
            <div class="form-control w-full flex flex-col max-w-xs">
                <progress class="progress progress-primary w-56" />
            </div>
        </div>
    {:then response}
        <div class="flex justify-center">
            <div class="px-10 w-full">
                <label class="label">
                    <span class="label-text"
                        >Embed Cache Size: {$cacheSize}</span
                    >
                </label>
                <input
                    on:change={(e) => {
                        cacheSize.update(parseInt(e.target.value));
                        concepts.cache($cacheSize);
                    }}
                    value={$cacheSize}
                    type="range"
                    min="0"
                    max={150}
                    step="1"
                    class="range range-sm"
                />
            </div>
        </div>
        {#if completionModels.length > 0}
            <div class="flex justify-center">
                <div class="form-control w-full max-w-xs mb-4">
                    <label class="label">
                        <span class="label-text"
                            >Pick a model to use for model generation</span
                        >
                    </label>
                    <select
                        value={selectedCompletionModel}
                        on:change={handleModelSelect}
                        class="select select-bordered"
                    >
                        <option
                            disabled
                            selected={selectedCompletionModel === null}
                            >Pick one</option
                        >
                        {#each completionModels as m (m)}
                            <option
                                value={m}
                                selected={selectedCompletionModel === m}
                                >{m}</option
                            >
                        {/each}
                    </select>
                </div>
            </div>
        {/if}
        {#if embeddingModels.length > 0}
            <div class="flex justify-center">
                <div class="form-control w-full max-w-xs mb-4">
                    <label class="label">
                        <span class="label-text"
                            >Pick a model to use for prompt embedding</span
                        >
                    </label>
                    <select
                        value={selectedEmbeddingModel}
                        on:change={handleEmbeddingSelect}
                        class="select select-bordered"
                    >
                        <option
                            disabled
                            selected={selectedEmbeddingModel === null}
                            >Pick one</option
                        >
                        {#each embeddingModels as m (m)}
                            <option
                                value={m}
                                selected={selectedEmbeddingModel === m}
                                >{m}</option
                            >
                        {/each}
                    </select>
                </div>
            </div>
        {/if}
    {/await}
</div>
