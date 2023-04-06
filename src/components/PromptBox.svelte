<script lang="ts">
    import { getDisplayWeight } from "$lib/weights.js";
    import { activePrompt } from "../lib/activePromptStore.js";
    import {
        zeroPromptHandling
    } from '../lib/zeroPromptHandling.js';

    let weightKey = "parsedWeight";

    $: {
        switch($activePrompt.weightMode) {
            case "circle": weightKey = "circleWeight"; break;
            case "bars": weightKey = "barWeight"; break;
            case "embed": weightKey = "embedWeight"; break;
            case "pie": weightKey = "pieWeight"; break;
        }
    }

    $: totalWeight = Object.values($activePrompt.weightedPrompts).reduce(
        (acc, wp) => wp[weightKey] + acc,
        0
    );

    $: highestRelativeWeight = Math.max(
        ...Object.values(($activePrompt.weightedPrompts)).map((wp) => wp[weightKey] / totalWeight)
    );

    function getRelativeWeight(weight) {
        return (
            (weight / totalWeight / highestRelativeWeight + 0.75) /
            2
        ).toFixed(2)
    }

    function handleClick() {
        const promptWeightPairs = Object.entries($activePrompt.weightedPrompts).filter(e => $zeroPromptHandling || getDisplayWeight(e[1], $activePrompt.weightMode)).map(([id, wp]) => {
            return `${wp.text}::${getDisplayWeight(wp, $activePrompt.weightMode)}`
        }).join(' ');
        navigator.clipboard.writeText(promptWeightPairs);
    }
</script>

<div
    on:click={handleClick}
    class="normal-case font-light text-left cursor-copy bg-slate-900 rounded-md p-4 w-full h-32 overflow-y-auto hover:bg-slate-800 active:bg-slate-950"
>
    <p class="text-sm select-none">
        {#each Object.entries($activePrompt.weightedPrompts).filter(e => $zeroPromptHandling || getDisplayWeight(e[1], $activePrompt.weightMode)) as [id, wp] (id)}<span
                style={`color: rgba(255,255,255,${getRelativeWeight(wp[weightKey])});`}
                >{wp.text}::<b>{getDisplayWeight(wp, $activePrompt.weightMode)} </b></span
            >
        {/each}
    </p>
</div>
