<script>
    import { dealiasedInstructions } from "../stores/instructions";
    export let togglePreview = ()=>{};
    export let isGenerating = false;
    export let handleGeneratePrompt = ()=>{};
</script>

<div class="w-full h-12 flex justify-start">
    <button on:click={togglePreview} class="btn btn-sm btn btn-info ml-4">Back</button>
</div>
<div class="p-4 overflow-y-auto">
    <p class="font-mono text-xs whitespace-pre-wrap">{$dealiasedInstructions}</p>
</div>
<div class="w-full p-2 h-12 flex justify-between">
    <button on:click={togglePreview} class="btn btn-sm btn btn-info">Preview</button>
    {#if isGenerating}
        <button class="btn btn-sm btn disabled"
            >Generating</button
        >
    {:else}
        <button
            on:click={handleGeneratePrompt}
            class="btn btn-sm btn-primary">Generate</button
        >
    {/if}
</div>