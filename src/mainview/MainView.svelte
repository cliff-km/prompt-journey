<script lang="ts">
    import { WeightMode } from "../types.js";
    import StageSelector from "./StageSelector.svelte";
    import { appStage } from "../stores/appStage.js";
    import ControlSelector from "./ControlSelector.svelte";
    import ControllerCircleSelector from "../controllers/ControllerCircleSelector.svelte";
    import { activePrompt } from "../stores/activePrompt.js";
    import { AppStage } from "../types";
    import ControlView from "./ControlView.svelte";
    import HistoryView from "./HistoryView.svelte";
    import ConceptView from "./ConceptView.svelte";
    import EmbedQueue from "./EmbedQueue.svelte";
    import ConceptControls from "./ConceptControls.svelte";
    import HistoryControls from "./HistoryControls.svelte";
</script>

<div class="relative w-full h-screen flex flex-col">
    <!-- Page content here -->
    <div class="w-full absolute top-0 z-10">
        <div class="w-full flex justify-between">
            <StageSelector />
            <EmbedQueue />
            {#if $appStage === AppStage.Build}
                <div>
                    <ControlSelector />
                    {#if $activePrompt.weightMode === WeightMode.Circle || $activePrompt.weightMode === WeightMode.Pie || $activePrompt.weightMode === WeightMode.Ring}
                        <ControllerCircleSelector />
                    {/if}
                </div>
            {:else if $appStage === AppStage.Concept}
                <ConceptControls />
            {:else if $appStage === AppStage.History}
                <HistoryControls />
            {/if}
        </div>
    </div>
    {#if $appStage === AppStage.Build}
        <div class="flex flex-col h-full place-content-between">
            <ControlView />
        </div>
    {:else if $appStage === AppStage.Concept}
        <div class="flex flex-col h-full mt-10 overflow-hidden">
            <ConceptView />
        </div>
    {:else if $appStage === AppStage.History}
        <div class="flex flex-col h-full mt-10 overflow-hidden">
            <HistoryView />
        </div>
    {/if}
</div>
