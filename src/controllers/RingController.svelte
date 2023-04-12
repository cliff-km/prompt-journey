<script lang="ts">
    import { isUndefined } from "mathjs";
    import { activePrompt } from "../stores/activePrompt.js";
    import RingControllerWidget from "./RingControllerWidget.svelte";

    let controllerW;
    let controllerH;
    let ringWeightScaling = $activePrompt.ringWeightScaling || 2;
    let ringExponentialScaling = !isUndefined($activePrompt.ringExponentialScaling) ? $activePrompt.ringExponentialScaling : true;
        
    $: {
        {
            activePrompt.update({
                ...activePrompt.get(),
                ringExponentialScaling,
                ringWeightScaling,
            });
        }
    }

    function handleReverse() {
        activePrompt.update({
            ...activePrompt.get(),
            ringReverse: !$activePrompt.ringReverse,
        });
    }
</script>

<div
    class="w-full h-full"
    bind:clientWidth={controllerW}
    bind:clientHeight={controllerH}
>
    <RingControllerWidget
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
            class="toggle toggle-xs"
            bind:checked={ringExponentialScaling}
        />
    </div>
    {#if ringExponentialScaling}
        <div class="w-full px-2">
            <label class="label">
                <span class="label-text">Scaling Power</span>
            </label>
            <input
                bind:value={ringWeightScaling}
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                class="range range-xs"
            />
        </div>
    {/if}
    <div class="w-32 px-2 pb-1 flex flex-col justify-end">
        <button
            on:click={handleReverse}
            class="btn btn-xs btn-primary">Reverse</button
        >
    </div>
</div>
