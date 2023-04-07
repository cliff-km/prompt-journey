<script lang="ts">
    import { promptList } from "../stores/promptStore.js";
    import pkg from "lodash";
    const { orderBy } = pkg;
    import { intializeActivePrompt, activePromptStore, activePrompt } from "../stores/activePromptStore.js";
    import { panelModeStore, panelMode } from "../stores/panelModeStore.js";
    import { selectedPromptStore, selectedPrompt } from "../stores/selectedPromptStore.js";
    import { getDisplayWeight } from "$lib/weights.js";

    function selectNew() {
        activePromptStore.updateActivePrompt(intializeActivePrompt({}, $activePrompt.weightMode));
        panelModeStore.updateMode("edit");
    }

    function selectPrompt(id, data) {
        selectedPromptStore.updateId(id);
        activePromptStore.updateActivePrompt({...data});
        panelModeStore.updateMode("edit");
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
                on:click={() => selectPrompt(promptId, data)}
                >
                {#each Object.entries(data.weightedPrompts) as [id, wp]}{wp.text}::<b
                        >{getDisplayWeight(wp, data.weightMode)}</b
                    >
                {/each}</a
            >
        </li>
    {/each}
</ul>
