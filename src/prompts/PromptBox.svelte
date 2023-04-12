<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import MultiPrompt from "./MultiPrompt.svelte";
    import SinglePrompt from "./SinglePrompt.svelte";
    import { activePrompt } from "../stores/activePrompt.js";
    import {
        showZeroPrompts,
    } from "../stores/showZeroPrompts.js";
    import { outputMultiPrompt } from "../stores/outputMultiPrompt.js";
    import {
        useWeightOrdering,
        useWeightOrderingStore,
    } from "../stores/useWeightOrdering";
    import { getPromptText } from "$lib/prompt";
    import { seed } from "../stores/slotSets";
    import { promptHistory } from "../stores/promptHistory";

    function handleClick() {
        const promptText = getPromptText(
            $activePrompt,
            $seed,
            $outputMultiPrompt,
            $useWeightOrdering,
            $showZeroPrompts
        );
        navigator.clipboard.writeText(promptText);
        seed.shuffle();
        promptHistory.add({
            id: uuidv4(),
            prompt: promptText,
            date: new Date(),
        });
    }

    function updateOutputMultiPrompt() {
        outputMultiPrompt.update(!$outputMultiPrompt);
    }

    function updateUseWeightOrdering() {
        useWeightOrderingStore.update(!$useWeightOrdering);
    }

    function updateZeroPromptHandling() {
        showZeroPrompts.update(!$showZeroPrompts);
    }
</script>

<div
    on:click={handleClick}
    class="normal-case font-light text-left cursor-copy bg-slate-900 rounded-t-md rounded-br-md p-4 w-full h-28 active:bg-slate-950 hover:bg-slate-800"
>
    {#if $outputMultiPrompt}
        <MultiPrompt />
    {:else}
        <SinglePrompt />
    {/if}
</div>

<div class="w-full rounded-b-md flex pl-2 justify-start bg-slate-900">
    <div class="mx-2 flex">
        <input
            on:change={updateOutputMultiPrompt}
            checked={$outputMultiPrompt}
            type="checkbox"
            class="toggle toggle-sm mt-2 mr-2"
        />
        <label class="label w-10">
            <span class="label-text"
                >{$outputMultiPrompt ? "Multi" : "Single"}</span
            >
        </label>
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
