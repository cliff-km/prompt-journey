<script lang="ts">
    import { processString } from "../lib/prompt.js";

    let conceptPool = new Set();

    function pasteConcepts() {
        console.log("pasted");
        navigator.clipboard.readText().then((text) => {
            const sentences = processString(text).map(
                (sentence) => sentence[0]
            );

            const nextSet = new Set(conceptPool);
            sentences.forEach((concept) => {
                nextSet.add(concept);
            });

            conceptPool = nextSet;
        });
    }
</script>

<div class="w-full h-full p-4 mt-12 overflow-y-auto" on:paste={pasteConcepts}>
    {#if conceptPool.size === 0}
        <p>Concepts will appear here when you paste them.</p>
    {:else}
        {#each Array.from(conceptPool).sort() as concept}
            <p>{concept}</p>
        {/each}
    {/if}
</div>
