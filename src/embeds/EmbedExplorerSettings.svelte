<script lang="ts">
    export let useExponentialScaling: boolean = false;
    export let toggleExponentialScaling: () => void = () => {};
    export let exponentialScaling: number = 2;
    export let setExponentialScaling: (scaling: number) => void = () => {};
    export let connectionLimit: number = 1;
    export let maxConnectionLimit: number = 1;
    export let setConnectionLimit: (limit: number) => void = () => {};
    export let clusterCount: number = 0;
    export let setClusterCount: (count: number) => void = () => {};
    export let maxClusterCount: number = 0;
    export let onShuffle = () => {};
</script>

<div class="px-2 py-4 pb-0 flex">
    <div class="min-w-max px-2">
        <label class="label">
            <span class="label-text">Exponential Scaling</span>
        </label>
        <input
            on:change={toggleExponentialScaling}
            type="checkbox"
            class="toggle toggle-sm"
            checked={useExponentialScaling}
        />
    </div>
    {#if useExponentialScaling}
        <div class="w-full px-2">
            <label class="label">
                <span class="label-text">Scaling Power</span>
            </label>
            <input
                on:change={(e)=>setExponentialScaling(parseFloat(e.target.value))}
                value={exponentialScaling}
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                class="range range-sm"
            />
        </div>
    {/if}
    <div class="w-full px-2">
        <label class="label">
            <span class="label-text">{connectionLimit}/{maxConnectionLimit} Prompts</span>
        </label>
        <input
            on:change={(e)=>setConnectionLimit(parseInt(e.target.value))}
            value={connectionLimit}
            type="range"
            min="1"
            max={maxConnectionLimit}
            step="1"
            class="range range-sm"
        />
    </div>
    {#if maxClusterCount > 0}
    <div class="">
        <div class="">
            <label class="label pb-1 m-0">
                <span class="label-text">Clusters</span>
            </label>
            <div class="btn-group btn-group-horizontal p-0">
                <button
                    class="btn btn-xs"
                    class:btn-active={clusterCount === 0}
                    on:click={() => setClusterCount(0)}
                >
                    0
                </button>
                <button
                    class="btn btn-xs"
                    class:btn-active={clusterCount === 2}
                    class:btn-disabled={maxClusterCount < 2}
                    on:click={() => setClusterCount(2)}
                >
                    2
                </button>
                <button
                    class="btn btn-xs"
                    class:btn-active={clusterCount === 4}
                    class:btn-disabled={maxClusterCount < 4}
                    on:click={() => setClusterCount(4)}
                >
                    4
                </button>
                <button
                    class="btn btn-xs"
                    class:btn-active={clusterCount === 6}
                    class:btn-disabled={maxClusterCount < 6}
                    on:click={() => setClusterCount(6)}
                >
                    6
                </button>
                <button
                    class="btn btn-xs"
                    class:btn-active={clusterCount === 8}
                    class:btn-disabled={maxClusterCount < 8}
                    on:click={() => setClusterCount(8)}
                >
                    8
                </button>
            </div>
        </div>
    </div>
    {/if}
    <div class="w-32 px-2 pb-1 flex flex-col justify-end">
        <button
            on:click={onShuffle}
            class="btn btn-xs btn-primary">Shuffle</button
        >
    </div>
</div>