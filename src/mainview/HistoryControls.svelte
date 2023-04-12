<script lang="ts">
    import { promptHistory } from "../stores/promptHistory";

    function clearHistory() {
        promptHistory.delete();
    }
</script>

<div class="flex justify-end p-2">
    <button
        class="btn btn-sm btn-error"
        on:click={clearHistory}
    >
        Delete History
    </button>
</div>