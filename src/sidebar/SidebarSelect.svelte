<script lang="ts">
    import type { WeightMode } from "../types.js";
    import { promptList } from "../stores/promptStore.js";
    import pkg from "lodash";
    const { orderBy } = pkg;
    import {
        intializeActivePrompt,
        activePromptStore,
        activePrompt,
    } from "../stores/activePromptStore.js";
    import { panelModeStore } from "../stores/panelModeStore.js";
    import {
        selectedPromptStore,
        selectedPrompt,
    } from "../stores/selectedPromptStore.js";
    import { getDisplayWeight } from "$lib/weights.js";

    console.log($promptList)

    function selectNew() {
        selectedPromptStore.delete();
        activePromptStore.update(
            intializeActivePrompt({}, $activePrompt.weightMode)
        );
        panelModeStore.update("edit");
    }

    function selectPrompt(id, data) {
        selectedPromptStore.update(id);
        activePromptStore.update({ ...data });
        panelModeStore.update("edit");
    }
</script>

<ul
    class="menu h-screen p-4 w-full bg-base-100 overflow-y-auto text-base-content inline-block"
>
    <li><a class="text-xs inline-block" on:click={selectNew}>New +</a></li>
    {#each orderBy($promptList, (i) => i[1].date, "desc") as [promptId, data] (promptId)}
        <li>
            <a
                class="text-xs inline-block"
                class:active={$selectedPrompt === promptId}
                on:click={() => selectPrompt(promptId, data)}
            >
                {#each Object.entries(data.weightedPrompts) as [id, wp]}{wp.text}<b
                        >:: </b
                    >
                {/each}</a
            >
        </li>
    {/each}
</ul>
