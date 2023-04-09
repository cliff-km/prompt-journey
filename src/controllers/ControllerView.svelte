<script lang="ts">
    import { WeightMode } from "../types.js";
    import ControllerSelector from "./ControllerSelector.svelte";
    import ControllerCircleSelector from "./ControllerCircleSelector.svelte";
    import CircleController from "./CircleController.svelte";
    import BarController from "./BarController.svelte";
    import PieController from "./PieController.svelte";
    import EmbedController from "./EmbedController.svelte";
    import PromptBox from "../prompts/PromptBox.svelte";
    import { activePrompt } from "../stores/activePromptStore.js";
    import RingController from "./RingController.svelte";
</script>

<div class="relative w-full h-full flex flex-col">
    <!-- Page content here -->
    <div class="flex flex-col h-full place-content-between">
        <div class="absolute top-0 right-0 z-10">
            <ControllerSelector />
            {#if $activePrompt.weightMode === WeightMode.Circle || $activePrompt.weightMode === WeightMode.Pie || $activePrompt.weightMode === WeightMode.Ring}
                <ControllerCircleSelector />
            {/if}
        </div>
        {#if $activePrompt.weightMode === WeightMode.Bars}
            <BarController />
        {:else if $activePrompt.weightMode === WeightMode.Pie}
            <PieController />
        {:else if $activePrompt.weightMode === WeightMode.Circle}
            <CircleController />
        {:else if $activePrompt.weightMode === WeightMode.Ring}
            <RingController />
        {:else if $activePrompt.weightMode === WeightMode.Embed}
            <EmbedController />
        {/if}
        <div class="h-48 w-full p-4 flex flex-col">
            <PromptBox />
        </div>
    </div>
</div>
