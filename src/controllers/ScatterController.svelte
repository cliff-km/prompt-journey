<script lang="ts">
    import { key } from "../stores/key";
    import PromptBox from "../prompts/PromptBox.svelte";
    import ScatterControllerWidget from "./ScatterControllerWidget.svelte";
</script>

{#if !$key}
    <div class="w-full h-full flex justify-center">
        <div class="flex flex-col justify-center">
            <div class="h-20 w-52">
                <p class="text-center text-lg">
                    Set OpenAI key in settings to use embedding map.
                </p>
            </div>
        </div>
    </div>
{:else}
    <ScatterControllerWidget />
{/if}
<PromptBox />
