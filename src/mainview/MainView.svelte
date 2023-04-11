<script lang="ts">
    import StageSelector from "./StageSelector.svelte";
    import { appStage } from "../stores/appStage.js";
    import { AppStage } from "../types";
    import ControlView from "./ControlView.svelte";
    import HistoryView from "./HistoryView.svelte";
    import ConceptView from "./ConceptView.svelte";
</script>

<div class="relative w-full h-screen flex flex-col">
    <!-- Page content here -->
    <div class="absolute top-0 left-0 z-10">
        <StageSelector />
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
