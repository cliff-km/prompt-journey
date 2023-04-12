<script lang="ts">
    import { WeightMode } from "../types.js";
    import CircleController from "../controllers/CircleController.svelte";
    import BarController from "../controllers/BarController.svelte";
    import PieController from "../controllers/PieController.svelte";
    import EmbedController from "../controllers/EmbedController.svelte";
    import PromptBox from "../prompts/PromptBox.svelte";
    import { activePrompt } from "../stores/activePrompt.js";
    import RingController from "../controllers/RingController.svelte";
</script>

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