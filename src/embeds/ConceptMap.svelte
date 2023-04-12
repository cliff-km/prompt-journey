<script lang="ts">
    import { key } from "../stores/key";
    import { embedQueue } from "../stores/embedQueue";
    import { concepts } from "../stores/concepts";
    import ConceptMapWidget from "./ConceptMapWidget.svelte";
</script>

{#if !$key}
    <div class="w-full h-full flex justify-center">
        <div class="flex flex-col justify-center">
            <div class="h-20 w-52">
                <p class="text-center text-lg">
                    Set OpenAI key in settings to use concept map.
                </p>
            </div>
        </div>
    </div>
{:else if Object.keys($embedQueue).length > 0}
    <div class="w-full h-full flex justify-center">
        <div class="flex flex-col justify-center">
            <div class="h-20 w-52">
                <progress
                    class="progress progress-primary w-56"
                    value={Object.keys($concepts).length - Object.keys($embedQueue).length}
                    max={Object.keys($concepts).length}
                />
            </div>
        </div>
    </div>
{:else}
    <ConceptMapWidget />
{/if}
