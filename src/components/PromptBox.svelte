<script lang="ts">
    export let prompts = {};
    export let weights = {};
    export let weightedPrompts = [];
    export let handleClick = () => {};

    $: totalWeight = Object.values(weights).reduce((acc, weight) => acc + weight, 0);
    $: highestRelativeWeight = Math.max(...Object.values(weights).map(w => w / totalWeight));

    $: {
        weightedPrompts = Object.entries(prompts).map(([id, prompt]) => {
            const w = weights[id] ? weights[id] : 1;
            return {
                id,
                text: prompt.text,
                weight: w,
                relativeWeight: ((((w / totalWeight) / highestRelativeWeight) + 0.75)/2).toFixed(2)
            }
        });
    }
</script>

<div on:click={handleClick} class="normal-case font-light text-left cursor-copy bg-slate-900 rounded-md p-4 w-full h-24 overflow-y-auto hover:bg-slate-800 active:bg-slate-950">
    <p class="text-sm select-none">{#each weightedPrompts as {id, text, weight, relativeWeight} (id)}<span style={`color: rgba(255,255,255,${relativeWeight});`}>{text}::<b>{weight}</b></span> {/each}</p>
</div>