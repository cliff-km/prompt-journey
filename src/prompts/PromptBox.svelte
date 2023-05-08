<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import MultiPrompt from "./MultiPrompt.svelte";
    import SinglePrompt from "./SinglePrompt.svelte";
    import { promptText } from "../stores/promptText.js";
    import { showZeroPrompts } from "../stores/showZeroPrompts.js";
    import { outputMode } from "../stores/outputMode.js";
    import {
        useWeightOrdering,
        useWeightOrderingStore,
    } from "../stores/useWeightOrdering";
    import { seed } from "../stores/slotSets";
    import { promptHistory } from "../stores/promptHistory";
    import { OutputMode } from "../types";
    import MagicPrompt from "./MagicPrompt.svelte";

    function handleClick() {
        navigator.clipboard.writeText($promptText);
        seed.shuffle();
        promptHistory.add({
            id: uuidv4(),
            prompt: $promptText,
            date: new Date(),
        });
    }

    function updateUseWeightOrdering() {
        useWeightOrderingStore.update(!$useWeightOrdering);
    }

    function updateZeroPromptHandling() {
        showZeroPrompts.update(!$showZeroPrompts);
    }

    function selectOutputMode(mode: OutputMode) {
        outputMode.update(mode);
    }
</script>

<div class="h-48 p-4">
    <div
        on:click={handleClick}
        class="normal-case font-light text-left cursor-copy bg-slate-900 rounded-t-md rounded-br-md p-4 w-full h-28 active:bg-slate-950 hover:bg-slate-800"
    >
        {#if $outputMode === OutputMode.Multi}
            <MultiPrompt />
        {:else if $outputMode === OutputMode.Single}
            <SinglePrompt />
        {:else if $outputMode === OutputMode.Magic}
            <MagicPrompt />
        {/if}
    </div>
    <div class="w-full rounded-b-md flex pl-2 justify-start bg-slate-900">
        <div class="mx-2 flex">
            <div
                class="btn-group btn-group-horizontal w-full p-1"
            >
                <button
                    class="btn btn-xs"
                    class:btn-active={$outputMode === OutputMode.Single}
                    on:click={() => selectOutputMode(OutputMode.Single)}
                >
                    Single
                </button>
                <button
                    class="btn btn-xs"
                    class:btn-active={$outputMode === OutputMode.Multi}
                    on:click={() => selectOutputMode(OutputMode.Multi)}
                >
                    Multi
                </button>
                <button
                    class="btn btn-xs"
                    class:btn-active={$outputMode === OutputMode.Magic}
                    on:click={() => selectOutputMode(OutputMode.Magic)}
                >
                    Magic
                </button>
            </div>
        </div>
        <div class="mx-2 flex">
            <input
                on:change={updateUseWeightOrdering}
                checked={$useWeightOrdering}
                type="checkbox"
                class="toggle toggle-sm mt-2 mr-2"
            />
            <label class="label">
                <span class="label-text">Use Weight Ordering</span>
            </label>
        </div>
        <div class="mx-2 flex">
            <input
                on:change={updateZeroPromptHandling}
                checked={$showZeroPrompts}
                type="checkbox"
                class="toggle toggle-sm mt-2 mr-2"
            />
            <label class="label">
                <span class="label-text">Include Zero Weights</span>
            </label>
        </div>
    </div>
</div>
