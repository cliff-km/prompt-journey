<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import { processString } from "../lib/prompt.js";
    import { promptStore } from "../stores/promptStore.js";
    import {
        intializeActivePrompt,
        activePromptStore,
        activePrompt,
        createWeightedPrompt,
    } from "../stores/activePromptStore.js";
    import { panelModeStore } from "../stores/panelModeStore.js";
    import { selectedPromptStore, selectedPrompt } from "../stores/selectedPromptStore.js";
    import debounce from "lodash/debounce";

    let newPromptText = "";
    let promptCount = Object.keys($activePrompt.weightedPrompts).length;

    $: {
        const newPromptCount = Object.keys($activePrompt.weightedPrompts).length;
        if (newPromptCount > promptCount) {
            promptCount = newPromptCount;
            newPromptText = "";
        }
    }

    $: promptText = Object.entries($activePrompt.weightedPrompts).map(([id, prompt]) => {
        return {
            id,
            text: prompt.text,
        };
    });

    function saveToStore() {
        promptStore.update(uuidv4(), {
            ...$activePrompt,
            date: Date.now(),
        });
        panelModeStore.update("select");
    }

    function pasteFromClipboard() {
        navigator.clipboard.readText().then((text) => {
            const sentences = processString(text);

            const maxSentenceWeight = Math.max(...sentences.map(([text, weight]) => weight));

            const weightedPrompts = sentences.reduce((acc, [text, parsedWeight], idx) => {
                    acc[idx] = createWeightedPrompt(idx, text, parsedWeight, parsedWeight/maxSentenceWeight);
                    return acc;
                }, {});

            activePromptStore.update(intializeActivePrompt(weightedPrompts, $activePrompt.weightMode));
        });
    }

    function handleDeletePrompt() {
        if ($selectedPrompt) promptStore.delete($selectedPrompt);
        selectedPromptStore.delete();
        activePromptStore.delete();
        panelModeStore.update("select");
    }

    const handleSinglePromptChange = debounce((id, text) => {
        const weightedPrompts = ({...$activePrompt.weightedPrompts});
        const updatedWP = { ...weightedPrompts[id], text};
        weightedPrompts[id] = updatedWP;

        activePromptStore.update({
            ...$activePrompt,
            weightedPrompts,
        });
    }, 500);

    const handleNewPromptChange = debounce((text) => {
        const nextId = Object.keys($activePrompt.weightedPrompts).length;
        const weightedPrompts = ({...$activePrompt.weightedPrompts});
        const updatedWP = createWeightedPrompt(nextId, text, 1);
        weightedPrompts[nextId] = updatedWP;

        activePromptStore.update({
            ...$activePrompt,
            weightedPrompts,
        });
    }, 500);
</script>

<div class="flex px-8 py-2 justify-center bg-base-100">
    <button class="btn btn-sm btn-info mx-2" on:click={pasteFromClipboard}
        >Paste</button
    >
    <button class="btn btn-sm btn-success mx-2" on:click={saveToStore}
        >Save</button
    >
    <button class="btn btn-sm btn-error mx-2" on:click={handleDeletePrompt}
        >Delete</button
    >
</div>
<ul
    class="h-screen p-4 w-full bg-base-100 overflow-y-auto text-base-content inline-block"
>
    {#each promptText as { id, text } (id)}
        <li class="p-1">
            <input
                value={text}
                on:input={(e) => handleSinglePromptChange(id, e.target.value)}
                type="text"
                placeholder=""
                class="input input-bordered input-sm w-full"
            />
        </li>
    {/each}
    <li class="p-1">
        <input
            bind:value={newPromptText}
            type="text"
            on:input={(e) => handleNewPromptChange(e.target.value)}
            placeholder="Add prompt"
            class="input input-bordered input-sm w-full italic"
        />
    </li>
</ul>
