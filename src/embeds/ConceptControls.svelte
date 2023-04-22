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
