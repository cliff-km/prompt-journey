<script lang="ts">
    import EmbedQueue from "./EmbedQueue.svelte";

    export let onChange = () => {};

    function pasteConcepts() {
        onChange();
    }
</script>

<div class=" w-full flex justify-end p-2">
    <EmbedQueue />
    <div class="btn-group btn-group-horizontal w-full flex justify-end">
        <button class="btn btn-sm" on:click={() => {}}> By Name </button>
        <button class="btn btn-sm" on:click={() => {}}> Related </button>
        <button class="btn btn-sm" on:click={() => {}}> Unrelated </button>
    </div>
    <button class="btn btn-sm btn-info ml-2" on:click={() => {}}> Paste </button>
</div>
