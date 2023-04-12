<script lang="ts">
    import { processString } from "../lib/prompt.js";
    import { concepts } from "../stores/concepts.js";

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
    <!--<div class="btn-group btn-group-horizontal w-full flex justify-end">
        <button class="btn btn-sm" on:click={() => {}}> By Name </button>
        <button class="btn btn-sm" on:click={() => {}}> Related </button>
        <button class="btn btn-sm" on:click={() => {}}> Unrelated </button>
    </div>-->
    <button class="btn btn-sm btn-info ml-2" on:click={pasteConcepts}>
        Paste
    </button>
</div>
