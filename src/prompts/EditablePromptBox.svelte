<script lang="ts">
    import { getDisplayWeight } from "$lib/weights.js";
    import { activePrompt } from "../lib/activePromptStore.js";

    $: weightKey = $activePrompt.weightMode === "circle" ? "circleWeight" : $activePrompt.weightMode === "bars" ? "barWeight" : "parsedWeight";

    $: totalWeight = Object.values($activePrompt.weightedPrompts).reduce(
        (acc, wp) => wp[weightKey] + acc,
        0
    );

    $: highestRelativeWeight = Math.max(
        ...Object.values(($activePrompt.weightedPrompts)).map((wp) => wp[weightKey] / totalWeight)
    );

    let text;
    let textContent;
    let html;

    $: {
        console.log('text', text);
        console.log('textContent', textContent);
        console.log('html', html);
    }

    function getRelativeWeight(weight) {
        return (
            (weight / totalWeight / highestRelativeWeight + 0.75) /
            2
        ).toFixed(2)
    }

    function handleClick() {
        const promptWeightPairs = Object.entries($activePrompt.weightedPrompts).map(([id, wp]) => {
            return `${wp.text}::${getDisplayWeight(wp, $activePrompt.weightMode)}`
        }).join(' ');
        navigator.clipboard.writeText(promptWeightPairs);
    }
</script>

<div
    on:click={handleClick}
	bind:innerHTML={html}
	bind:innerText={text}
	bind:textContent={textContent}
    contenteditable="true"
    class="normal-case font-light text-left bg-slate-900 rounded-md p-4 w-full h-32 overflow-y-auto"
>
    <p class="text-sm">
        {#each Object.entries($activePrompt.weightedPrompts) as [id, wp] (id)}<span
                style={`color: rgba(255,255,255,${getRelativeWeight(wp[weightKey])});`}
                >{wp.text}::<b>{getDisplayWeight(wp, $activePrompt.weightMode)} </b></span
            >
        {/each}
    </p>
</div>
