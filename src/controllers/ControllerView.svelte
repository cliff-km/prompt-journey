<script lang="ts">
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

    function selectControllerMode(mode) {
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
                class:btn-active={$activePrompt.weightMode === "bars"}
                on:click={() => selectControllerMode("bars")}
            >
                <IconBars />
            </button>
            <button
                class="btn btn-sm"
                class:btn-active={$activePrompt.weightMode === "pie"}
                on:click={() => selectControllerMode("pie")}
            >
                <IconPie />
            </button>
            <button
                class="btn btn-sm"
                class:btn-active={$activePrompt.weightMode === "circle"}
                on:click={() => selectControllerMode("circle")}
            >
                <IconCircle />
            </button>
            <button
                class="btn btn-sm"
                class:btn-active={$activePrompt.weightMode === "embed"}
                on:click={() => selectControllerMode("embed")}
            >
                <IconScatter />
            </button>
        </div>
        {#if $activePrompt.weightMode === "bars"}
            <BarController />
        {:else if $activePrompt.weightMode === "pie"}
            <PieController />
        {:else if $activePrompt.weightMode === "circle"}
            <CircleController />
        {:else if $activePrompt.weightMode === "embed"}
            <EmbedController />
        {/if}
        <div class="h-48 w-full p-4 flex flex-col">
            <PromptBox/>
        </div>
    </div>
</div>
