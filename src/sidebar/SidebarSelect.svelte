<script lang="ts">
    import type { WeightMode } from "../types.js";
    import { promptList } from "../stores/prompt.js";
    import pkg from "lodash";
    const { orderBy } = pkg;
    import {
        intializeActivePrompt,
        activePrompt,
    } from "../stores/activePrompt.js";
    import { panelMode } from "../stores/panelMode.js";
    import {
        selectedPrompt,
    } from "../stores/selectedPrompt.js";

    function selectNew() {
        selectedPrompt.delete();
        activePrompt.update(
            intializeActivePrompt({}, $activePrompt.weightMode)
        );
        panelMode.update("edit");
    }

    function selectPrompt(id, data) {
        selectedPrompt.update(id);
        activePrompt.update({ ...data });
        panelMode.update("edit");
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
                        >::
                    </b>
                {/each}</a
            >
        </li>
    {/each}
</ul>
