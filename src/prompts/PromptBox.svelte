<script lang="ts">
    import { getDisplayWeight, getRelativeWeight } from "$lib/weights.js";
    import { activePrompt } from "../stores/activePromptStore.js";
    import {
        zeroPromptHandling
    } from '../stores/zeroPromptHandling.js';

    function handleClick() {
        const promptWeightPairs = Object.entries($activePrompt.weightedPrompts).filter(e => $zeroPromptHandling || getDisplayWeight($activePrompt, parseInt(e[0]))).map(([id, wp]) => {
            return `${wp.text}::${getDisplayWeight($activePrompt, parseInt(id))}`
        }).join(' ');
        navigator.clipboard.writeText(promptWeightPairs);
    }
</script>

<div
    on:click={handleClick}
    class="normal-case font-light text-left cursor-copy bg-slate-900 rounded-md p-4 w-full h-32 overflow-y-auto hover:bg-slate-800 active:bg-slate-950"
>
    <p class="text-sm select-none">
        {#each Object.entries($activePrompt.weightedPrompts).filter(e => $zeroPromptHandling || getDisplayWeight($activePrompt, e[0])) as [id, wp] (id)}<span
                style={`color: rgba(255,255,255,${Math.max(0.25, getRelativeWeight($activePrompt, id))});`}
                >{wp.text}::<b>{getDisplayWeight($activePrompt, id)} </b></span
            >
        {/each}
    </p>
</div>
