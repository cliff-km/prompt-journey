<script lang="ts">
    import { promptHistory } from "../stores/promptHistory";
    import HistoryControls from "./HistoryControls.svelte";

    function copy(prompt: string) {
        navigator.clipboard.writeText(prompt);
    }
</script>


<div class="absolute top-0 right-0 z-10">
    <HistoryControls />
</div>
<div class="w-full p-4 overflow-y-auto">
    <table class="table w-full">
        <!-- head -->
        <thead>
            <tr>
                <th />
                <th>Date</th>
                <th>Prompt</th>
            </tr>
        </thead>
        <tbody>
            {#each $promptHistory as pe, i (i)}
                <!-- row 1 -->
                <tr>
                    <th>{i + 1}</th>
                    <td>{pe.date}</td>
                    <td
                        on:click={() => copy(pe.prompt)}
                        class="cursor-copy max-w-xl text-ellipsis whitespace-nowrap overflow-hidden select-none hover:text-white"
                    >
                        <span> {pe.prompt}</span>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
