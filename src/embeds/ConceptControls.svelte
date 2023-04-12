<script lang="ts">
    import { ConceptMode } from "../types";
    import IconList from "../icon/IconList.svelte";
    import IconScatter from "../icon/IconScatter.svelte";
    import { processString } from "../lib/prompt.js";
    import { concepts } from "../stores/concepts.js";
    import { conceptMode } from "../stores/conceptMode";

    function pasteConcepts() {
        console.log("pasted");
        navigator.clipboard.readText().then((text) => {
            const sentences = processString(text).map(
                (sentence) => sentence[0] as string
            );

            const c = $concepts;

            sentences.forEach((s) => {
                if (!c[s]) {
                    concepts.update(s, null);
                }
            });
        });
    }
</script>

<div class="flex justify-center p-2">
    <div class="btn-group btn-group-horizontal w-full flex justify-end">
        <button
            class="btn btn-sm"
            class:btn-active={$conceptMode === ConceptMode.List}
            on:click={() => conceptMode.set(ConceptMode.List)}
            ><IconList /></button
        >
        <button
            class="btn btn-sm"
            class:btn-active={$conceptMode === ConceptMode.Map}
            on:click={() => conceptMode.set(ConceptMode.Map)}
            ><IconScatter /></button
        >
    </div>
    <button class="btn btn-sm btn-info ml-2" on:click={pasteConcepts}>
        Paste
    </button>
</div>
