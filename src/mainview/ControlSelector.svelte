<script lang="ts">
    import { WeightMode } from "../types.js";
    import IconCircle from "../icon/IconCircle.svelte";
    import IconScatter from "../icon/IconScatter.svelte";
    import { activePrompt } from "../stores/activePrompt.js";
    import IconDice from "../icon/IconDice.svelte";

    function selectControllerMode(mode: WeightMode) {
        const ap = {...$activePrompt, weightMode: mode};
        activePrompt.update(ap);
    }
</script>

<div class="btn-group btn-group-horizontal w-full flex justify-end p-2">
    <button
        class="btn btn-sm"
        class:btn-active={$activePrompt.weightMode === WeightMode.Random}
        on:click={() => selectControllerMode(WeightMode.Random)}
    >
        <IconDice />
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