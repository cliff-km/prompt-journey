<script lang="ts">
    import { promptHistory } from "../stores/promptHistory";

    export let onChange = () => {};

    function clearHistory() {
        promptHistory.delete();
        onChange();
    }
</script>

<div class=" w-full flex justify-end p-2">
    <button
        class="btn btn-sm btn-error"
        on:click={clearHistory}
    >
        Delete History
    </button>
</div>