<script lang="ts">
    import { WeightMode } from "../types.js";
    import CircleController from "./CircleController.svelte";
    import BarController from "./BarController.svelte";
    import PieController from "./PieController.svelte";
    import EmbedController from "./EmbedController.svelte";
    import PromptBox from "../prompts/PromptBox.svelte";
    import IconBars from "../svg/IconBars.svelte";
    import IconCircle from "../svg/IconCircle.svelte";
    import IconScatter from "../svg/IconScatter.svelte";
    import { activePromptStore, activePrompt } from "../stores/activePromptStore.js";
    import IconPie from "../svg/IconPie.svelte";

    function selectControllerMode(mode: WeightMode) {
        const ap = {...$activePrompt, weightMode: mode};
        activePromptStore.update(ap);
    }
</script>

<div class="w-full h-full flex flex-col">
    <!-- Page content here -->
    <div class="flex flex-col h-full place-content-between">
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
                class:btn-active={$activePrompt.weightMode === WeightMode.Pie}
                on:click={() => selectControllerMode(WeightMode.Pie)}
            >
                <IconPie />
            </button>
            <button
                class="btn btn-sm"
                class:btn-active={$activePrompt.weightMode === WeightMode.Circle}
                on:click={() => selectControllerMode(WeightMode.Circle)}
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
        {#if $activePrompt.weightMode === WeightMode.Bars}
            <BarController />
        {:else if $activePrompt.weightMode === WeightMode.Pie}
            <PieController />
        {:else if $activePrompt.weightMode === WeightMode.Circle}
            <CircleController />
        {:else if $activePrompt.weightMode === WeightMode.Embed}
            <EmbedController />
        {/if}
        <div class="h-48 w-full p-4 flex flex-col">
            <PromptBox/>
        </div>
    </div>
</div>
