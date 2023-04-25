<script lang="ts">
    import { WeightMode } from "../types.js";
    import { activePrompt } from "../stores/activePrompt.js";

    function selectControllerMode(mode: WeightMode) {
        const ap = {...$activePrompt, weightMode: mode};
        activePrompt.update(ap);
    }
</script>

<div class="btn-group btn-group-horizontal w-full flex justify-center p-1">
    <button
        class="btn btn-xs"
        class:btn-active={$activePrompt.weightMode === WeightMode.EmbedRandom}
        on:click={() => selectControllerMode(WeightMode.EmbedRandom)}
    >
        Random
    </button>
    <button
        class="btn btn-xs"
        class:btn-active={$activePrompt.weightMode === WeightMode.EmbedGrid}
        on:click={() => selectControllerMode(WeightMode.EmbedGrid)}
    >
        Grid
    </button>
    <button
        class="btn btn-xs"
        class:btn-active={$activePrompt.weightMode === WeightMode.Embed}
        on:click={() => selectControllerMode(WeightMode.Embed)}
    >
        Embed
    </button>
</div>