<script lang="ts">
    import { WeightMode } from "../types.js";
    import IconPie from "../icon/IconPie.svelte";
    import IconCompass from "../icon/IconCompass.svelte";
    import IconRing from "../icon/IconRing.svelte";
    import { activePromptStore, activePrompt } from "../stores/activePromptStore.js";

    function selectControllerMode(mode: WeightMode) {
        const ap = {...$activePrompt, weightMode: mode};
        activePromptStore.update(ap);
    }
</script>

<div class="btn-group btn-group-horizontal w-full flex justify-center p-1">
    <button
        class="btn btn-xs"
        class:btn-active={$activePrompt.weightMode === WeightMode.Pie}
        on:click={() => selectControllerMode(WeightMode.Pie)}
    >
        <IconPie />
    </button>
    <button
        class="btn btn-xs"
        class:btn-active={$activePrompt.weightMode === WeightMode.Circle}
        on:click={() => selectControllerMode(WeightMode.Circle)}
    >
        <IconCompass />
    </button>
    <button
        class="btn btn-xs"
        class:btn-active={$activePrompt.weightMode === WeightMode.Ring}
        on:click={() => selectControllerMode(WeightMode.Ring)}
    >
        <IconRing />
    </button>
</div>