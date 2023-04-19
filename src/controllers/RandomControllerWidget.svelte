<script lang="ts">
    import type { WeightedPrompt } from "../types";
    import { activePrompt } from "../stores/activePrompt.js";
    import { getDisplayWeight, getWeightOpacity } from "../lib/weights";
    import { seed } from "../stores/slotSets";
    import { onDestroy } from "svelte";

    // display state
    export let center = [0, 0];
    export let dimensions = [100, 100];
    export let maxWidth = 1000;
    export let pointRadius = 10;
    export let textWidth = 250;
    export let horizontalPad = 20;
    export let verticalPad = 2;
    export let textBarPad = 10;
    export let fontSize = 13;
    export let handleWidth = 20;

    $: prompts = Object.entries($activePrompt.weightedPrompts).map(
        ([id, prompt], idx) => {
            return [parseInt(id), idx, prompt];
        }
    ) as [number, number, WeightedPrompt][];

    function getPromptCount () {
        return Object.keys($activePrompt.weightedPrompts).length;
    }

    $: weights = prompts.map(([id, idx, prompt]) => {
        return [id, prompt.randomWeight || 0];
    });

    $: sortedWeights = weights.sort((a, b) => b[1] - a[1]);

    const seedUnsub = seed.subscribe(() => {
        shuffle();
    });

    onDestroy(() => {
        seedUnsub();
    });

    function setPromptLimit(limit: number) {
        activePrompt.update({
            ...$activePrompt,
            randomPromptLimit: limit,
        });

        shuffle();
    }

    function shuffle() {
        const weightedPrompts = Object.entries($activePrompt.weightedPrompts)
            .sort((a, b) => Math.random() - 0.5)
            .reduce((acc, [id, prompt], idx) => {
                acc[id] = {
                    ...prompt,
                    randomWeight:
                        idx <
                        ($activePrompt.randomPromptLimit || getPromptCount())
                            ? Math.random()
                            : 0,
                };
                return acc;
            }, {} as Record<string, WeightedPrompt>);

        activePrompt.update({
            ...$activePrompt,
            weightedPrompts,
        });
    }
</script>

<div class="w-full h-full flex flex-col">
    <div
        class="p-4 w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto"
    >
        {#each sortedWeights as [id, weight]}
            <div class="hover:bg-slate-800 rounded-md p-2 text-xs">
                <p
                    style={`color: rgba(255,255,255, ${getWeightOpacity(
                        weight
                    )});`}
                >
                    {prompts[id][2].text}:{getDisplayWeight($activePrompt, id)}
                </p>
            </div>
        {/each}
    </div>
    <div class="px-2 py-4 pb-0 flex">
        <div class="w-full px-2">
            <label class="label">
                <span class="label-text"># Prompts</span>
            </label>
            <input
                on:change={(e) => setPromptLimit(parseInt(e.target.value))}
                value={$activePrompt.randomPromptLimit || getPromptCount()}
                type="range"
                min="1"
                max={getPromptCount()}
                step="1"
                class="range range-sm"
            />
        </div>
        <div class="w-32 px-2 pb-1 flex flex-col justify-end">
            <button on:click={shuffle} class="btn btn-xs btn-primary"
                >Shuffle</button
            >
        </div>
    </div>
    <slot></slot>
</div>
