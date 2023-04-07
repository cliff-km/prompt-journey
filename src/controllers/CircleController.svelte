<script lang="ts">
    import { isUndefined } from "mathjs";
    import { activePromptStore, activePrompt } from "../stores/activePromptStore.js";
    import CircleControllerWidget from "./CircleControllerWidget.svelte";

    let controllerW;
    let controllerH;
    let circleWeightScaling = $activePrompt.circleWeightScaling || 2;
    let circleExponentialScaling = !isUndefined($activePrompt.circleExponentialScaling) ? $activePrompt.circleExponentialScaling : true;
        
    $: {
        {
            activePromptStore.update({
                ...activePromptStore.get(),
                circleExponentialScaling,
                circleWeightScaling,
            });
        }
    }

</script>

<div
    class="w-full h-full"
    bind:clientWidth={controllerW}
    bind:clientHeight={controllerH}
>
    <CircleControllerWidget
        center={[Math.round(controllerW / 2), Math.round(controllerH / 2)]}
        radius={Math.round(Math.min(controllerW, controllerH) / 2) - 150}
    />
</div>
<div class="px-2 py-4 pb-0 flex">
    <div class="w-52 px-2">
        <label class="label">
            <span class="label-text">Exponential Scaling</span>
        </label>
        <input
            type="checkbox"
            class="toggle"
            bind:checked={circleExponentialScaling}
        />
    </div>
    {#if circleExponentialScaling}
        <div class="w-full px-2">
            <label class="label">
                <span class="label-text">Scaling Power</span>
            </label>
            <input
                bind:value={circleWeightScaling}
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                class="range"
            />
        </div>
    {/if}
</div>
