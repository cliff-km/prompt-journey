<script lang="ts">
    import type { PromptHistory } from "../types";
    import { onMount } from "svelte";
    import { promptHistory } from "../stores/promptHistory";
    import HistoryControls from "./HistoryControls.svelte";
    import Paginator from "./Paginator.svelte";

    let currentPage = 1;
    let pageSize = 10;
    let pageChunk = [] as PromptHistory;

    
    function setPageChunk() {
        pageChunk = $promptHistory.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        );
    }

    function copy(prompt: string) {
        navigator.clipboard.writeText(prompt);
    }

    function changePage(page: number) {
        currentPage = page;
        setPageChunk();
    }

    function changePageSize(size: number) {
        currentPage = 1;
        pageSize = size;
        setPageChunk();
    }

    onMount(() => {
        setPageChunk();
    });
</script>

<div class="absolute top-0 right-0 z-10">
    <HistoryControls onChange={setPageChunk} />
</div>
<Paginator
    total={Math.ceil($promptHistory.length / pageSize)}
    current={currentPage}
    size={pageSize}
    onChange={changePage}
    onResize={changePageSize}
/>
<div class="w-full px-4 overflow-y-auto">
    <table class="table w-full">
        <!-- head -->
        <thead>
            <tr>
                <th>Date</th>
                <th>Prompt</th>
            </tr>
        </thead>
        <tbody>
            {#each pageChunk as pe, i (i)}
                <!-- row 1 -->
                <tr>
                    <td style="max-width: 10rem; width: 20rem;" class="whitespace-nowrap">{pe.date.toDateString()}</td>
                    <td
                        on:click={() => copy(pe.prompt)}
                        style="max-width: 20px;"
                        class="cursor-copy text-ellipsis whitespace-nowrap overflow-hidden select-none hover:text-white"
                    >
                        <span> {pe.prompt}</span>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
