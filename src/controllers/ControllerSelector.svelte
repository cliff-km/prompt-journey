<script lang="ts">
    import { WeightMode } from "../types.js";
    import IconBars from "../icon/IconBars.svelte";
    import IconCircle from "../icon/IconCircle.svelte";
    import IconScatter from "../icon/IconScatter.svelte";
    import { activePromptStore, activePrompt } from "../stores/activePromptStore.js";

    function selectControllerMode(mode: WeightMode) {
        const ap = {...$activePrompt, weightMode: mode};
        activePromptStore.update(ap);
    }
</script>

<div class="btn-group btn-group-horizontal w-full flex justify-end p-2">
    <button
        class="btn btn-sm"
        class:btn-active={$activePrompt.weightMode === WeightMode.Bars}
        on:click={() => selectControllerMode(WeightMode.Bars)}
    >
        <IconBars />
    </button>
    <button
        class="btn btn-sm"
        class:btn-active={$activePrompt.weightMode === WeightMode.Circle || $activePrompt.weightMode === WeightMode.Pie || $activePrompt.weightMode === WeightMode.Ring}
        on:click={() => selectControllerMode(WeightMode.Pie)}
    >
        <IconCircle />
    </button>
    <button
        class="btn btn-sm"
        class:btn-active={$activePrompt.weightMode === WeightMode.Embed}
        on:click={() => selectControllerMode(WeightMode.Embed)}
    >
        <IconScatter />
    </button>
</div>