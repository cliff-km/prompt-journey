<script lang="ts">
    export let prompts = {};
    export let handlePromptChange = (id, text) => {};
    export let handleNewPromptChange = (text) => {};
    export let handlePaste = () => {};
    export let handleDelete = () => {};
    export let handleSave = () => {};

    let newPromptText = "";
    let promptCount = Object.keys(prompts).length;

    $: {
        const newPromptCount = Object.keys(prompts).length;
        if (newPromptCount > promptCount) {
            promptCount = newPromptCount;
            newPromptText = "";
        }
    }

    $: promptText = Object.entries(prompts).map(([id, prompt]) => {
        return {
            id,
            text: prompt.text
        }
    });
</script>
  
<div class="flex px-8 py-2 justify-center bg-base-100">
    <button class="btn btn-sm btn-info mx-2" on:click={handlePaste}>Paste</button>
    <button class="btn btn-sm btn-success mx-2" on:click={handleSave}>Save</button>
    <button class="btn btn-sm btn-error mx-2" on:click={handleDelete}>Delete</button>
</div>
<ul class="h-screen p-4 w-full bg-base-100 overflow-y-auto text-base-content inline-block">
    {#each promptText as {id, text} (id)}
        <li class="p-1"><input value={text} on:input={(e)=>handlePromptChange(id, e.target.value)} type="text" placeholder="" class="input input-bordered input-sm w-full" /></li>
    {/each}
    <li class="p-1"><input bind:value={newPromptText} type="text" on:input={(e)=>handleNewPromptChange(e.target.value)} placeholder="Add prompt" class="input input-bordered input-sm w-full italic"/></li>
</ul>