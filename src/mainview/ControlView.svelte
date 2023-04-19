<script lang="ts">
    import { WeightMode } from "../types.js";
    import CircleController from "../controllers/CircleController.svelte";
    import PieController from "../controllers/PieController.svelte";
    import EmbedController from "../controllers/EmbedController.svelte";
    import PromptBox from "../prompts/PromptBox.svelte";
    import { activePrompt } from "../stores/activePrompt.js";
    import RingController from "../controllers/RingController.svelte";
    import RandomController from "../controllers/RandomController.svelte";
</script>

<div class="w-full h-full flex flex-col">
    {#if $activePrompt.weightMode === WeightMode.Random}
        <RandomController />
    {:else if $activePrompt.weightMode === WeightMode.Pie}
        <PieController />
    {:else if $activePrompt.weightMode === WeightMode.Circle}
        <CircleController />
    {:else if $activePrompt.weightMode === WeightMode.Ring}
        <RingController />
    {:else if $activePrompt.weightMode === WeightMode.Embed}
        <EmbedController />
    {/if}
</div>
