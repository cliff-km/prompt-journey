<script lang="ts">
    import { processString } from "../lib/prompt.js";
    import { concepts } from "../stores/concepts.js";
    import { embedQueue } from "../stores/embedQueue";
    import Paginator from "../mainview/Paginator.svelte";
    import debounce from "lodash/debounce";

    let currentPage = 1;
    let pageSize = 10;

    function pasteConcepts() {
        console.log("pasted");
        navigator.clipboard.readText().then((text) => {
            const sentences = processString(text).map(
                (sentence) => sentence[0] as string
            );

            const c = $concepts;

            sentences.forEach((s) => {
                if (!c[s]) {
                    embedQueue.update((q) => {
                        q[s] = false;
                        return q;
                    });
                }
            });
        });
    }

    $: conceptPool = Object.keys($concepts);

    $: pageCount = Math.ceil(conceptPool.length / pageSize);
    $: pageChunk = Array.from(conceptPool)
        .sort()
        .slice((currentPage - 1) * pageSize, currentPage * pageSize);

    function copy(prompt: string) {
        navigator.clipboard.writeText(prompt);
    }

    function changePage(page: number) {
        currentPage = page;
    }

    function changePageSize(size: number) {
        currentPage = 1;
        pageSize = size;
    }

    const changeConcept = debounce((concept: string) => {
        embedQueue.update((q) => {
            q[concept] = false;
            return q;
        });
    }, 500);
</script>

<Paginator
    total={pageCount}
    current={currentPage}
    size={pageSize}
    onChange={changePage}
    onResize={changePageSize}
/>
<div class="w-full px-4 overflow-y-auto" on:paste={pasteConcepts}>
    <table class="table w-full">
        <!-- head -->
        <thead>
            <tr>
                <th>Concept</th>
                <th />
            </tr>
        </thead>
        <tbody>
            {#each pageChunk as c, i (i)}
                <!-- row 1 -->
                <tr>
                    <td
                        style="max-width: 20px;"
                        class="text-ellipsis cursor-copy whitespace-nowrap overflow-hidden select-none hover:text-white"
                        on:click={() => copy(c)}
                        on:change={(e) => changeConcept(e.target.value)}>{c}</td
                    >
                    <td
                        style="max-width: 4rem; width: 4rem;"
                        class=""
                        on:click={() => concepts.remove(c)}
                    >
                        <button class="btn btn-sm btn-circle btn-outline">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="red"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"
                                /></svg
                            >
                        </button></td
                    >
                </tr>
            {/each}
        </tbody>
    </table>
</div>
