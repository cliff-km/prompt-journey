<script lang="ts">
    export let openaiKey = "";
    export let handleOpenAIKeyChange = (key) => {};

    $: handleOpenAIKeyChange(openaiKey);
</script>
  
<div class="h-full p-4 w-full bg-base-100 overflow-y-auto text-base-content inline-block">
    <div class="flex justify-center">
        <div class="form-control w-full max-w-xs">
            <label class="label">
                <span class="label-text-alt">Open AI Key</span>
            </label>
            <input bind:value={openaiKey} type="password" placeholder="Open AI Key" class="input input-bordered w-full max-w-xs" />
        </div>
    </div>
</div>