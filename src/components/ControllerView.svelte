<script lang="ts">
    import CircleController from "./CircleController.svelte";
    import BarController from "./BarController.svelte";
    import PromptBox from "../components/PromptBox.svelte";
    import IconBars from "../components/IconBars.svelte";
    import IconCircle from "../components/IconCircle.svelte";
    import { activePromptStore, activePrompt } from "../lib/activePromptStore.js";

    function selectControllerMode(mode) {
        const ap = {...$activePrompt, weightMode: mode};
        activePromptStore.updateActivePrompt(ap);
    }
</script>

<div class="w-full h-full flex flex-col">
    <!-- Page content here -->
    <div class="flex flex-col h-full place-content-between">
        <div class="btn-group btn-group-horizontal w-full flex justify-end p-2">
            <button
                class={$activePrompt.weightMode === "bars"
                    ? "btn btn-sm btn-active"
                    : "btn btn-sm"}
                on:click={() => selectControllerMode("bars")}
            >
                <IconBars />
            </button>
            <button
                class={$activePrompt.weightMode === "circle"
                    ? "btn btn-sm btn-active"
                    : "btn btn-sm"}
                on:click={() => selectControllerMode("circle")}
            >
                <IconCircle />
            </button>
        </div>
        {#if $activePrompt.weightMode === "bars"}
            <BarController />
        {:else if $activePrompt.weightMode === "circle"}
            <CircleController />
        {/if}
        <div class="h-32 w-full p-4 flex flex-col">
            <div class="h-32 w-full">
                <PromptBox/>
            </div>
        </div>
    </div>
</div>
