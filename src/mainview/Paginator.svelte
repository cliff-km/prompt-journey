<script lang="ts">
    export let total: number;
    export let current: number;
    export let size: number;
    export let onChange: (page: number) => void;
    export let onResize: (size: number) => void;
</script>

<div class="w-full flex justify-between p-4">
    <div class="flex justify-start">
        <div class="btn-group">
            <button
                class="btn"
                class:btn-disabled={current === 1}
                on:click={() => onChange(1)}>{"<<"}</button
            ><button
                class="btn"
                class:btn-disabled={current === 1}
                on:click={() => onChange(current - 1)}>{"<"}</button
            >
            <button class="btn" on:click={() => onChange(current)}
                class:btn-disabled={total === 0}
                >{current}</button
            ><button
                class="btn"
                class:btn-disabled={total === 0 || current === total}
                on:click={() => onChange(current + 1)}>{">"}</button
            ><button
                class="btn"
                class:btn-disabled={total === 0 || current === total}
                on:click={() => onChange(total)}>{">>"}</button
            >
        </div>
    </div>
    <div class="flex">
        <label for="page-size" class="p-2 text-md min-w-xs">Page Size</label>
        <select class="select max-w-xs" on:change={(e)=>onResize(e.target.value)}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
        </select>
    </div>
</div>
