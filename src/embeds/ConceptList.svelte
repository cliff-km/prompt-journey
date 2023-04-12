<script lang="ts">
    import { processString } from "../lib/prompt.js";
    import { concepts } from "../stores/concepts.js";
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
                    concepts.update(s, null);
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
        concepts.update(concept, null);
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
                <th />
            </tr>
        </thead>
        <tbody>
            {#each pageChunk as c, i (i)}
                <!-- row 1 -->
                <tr>
                    <td
                        style="max-width: 20px;"
                        class="text-ellipsis whitespace-nowrap overflow-hidden select-none hover:text-white"
                        on:change={(e) => changeConcept(e.target.value)}
                    >
                        <input
                            value={c}
                            type="text"
                            placeholder=""
                            class="input input-bordered input-sm w-full"
                        />
                    </td>
                    <td style="max-width: 4rem; width: 4rem;">
                        <button
                            class="btn btn-sm btn-circle btn-outline"
                            on:click={() => copy(c)}
                        >
                            <svg
                                class="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                ><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path
                                    fill="currentColor"
                                    d="M272 0H396.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H272c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128H192v64H64V448H256V416h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z"
                                /></svg
                            >
                        </button>
                    </td>
                    <td style="max-width: 4rem; width: 4rem;" class="" on:click={()=>concepts.remove(c)}>
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