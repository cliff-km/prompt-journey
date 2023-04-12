<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import { processString } from "../lib/prompt.js";
    import { promptStore } from "../stores/prompt.js";
    import {
        intializeActivePrompt,
        activePrompt,
        createWeightedPrompt,
    } from "../stores/activePrompt.js";
    import { panelMode } from "../stores/panelMode.js";
    import {
        selectedPrompt,
    } from "../stores/selectedPrompt.js";
    import debounce from "lodash/debounce";

    let newPromptText = "";
    let promptCount = Object.keys($activePrompt.weightedPrompts).length;

    $: {
        const newPromptCount = Object.keys(
            $activePrompt.weightedPrompts
        ).length;
        if (newPromptCount > promptCount) {
            promptCount = newPromptCount;
            newPromptText = "";
        }
    }

    $: promptText = Object.entries($activePrompt.weightedPrompts).map(
        ([id, prompt]) => {
            return {
                id,
                text: prompt.text,
            };
        }
    );

    function saveToStore() {
        promptStore.update(uuidv4(), {
            ...$activePrompt,
            date: Date.now(),
        });
        panelMode.update("select");
    }

    function pasteFromClipboard() {
        navigator.clipboard.readText().then((text) => {
            const sentences = processString(text);

            handleSignificantPromptChange(sentences);
        });
    }

    function handleSignificantPromptChange(prompts) {
        const maxSentenceWeight = Math.max(
            ...prompts.map(([text, weight]) => weight)
        );
        const weightedPrompts = prompts.reduce(
            (acc, [text, parsedWeight], idx) => {
                acc[idx] = createWeightedPrompt(
                    idx,
                    text,
                    parsedWeight,
                    parsedWeight / maxSentenceWeight
                );
                return acc;
            },
            {}
        );
        selectedPrompt.delete();
        activePrompt.update(
            intializeActivePrompt(weightedPrompts, $activePrompt.weightMode)
        );
        newPromptText = "";
    }

    function handleDeletePrompt() {
        if ($selectedPrompt) promptStore.delete($selectedPrompt);
        selectedPrompt.delete();
        activePrompt.delete();
        panelMode.update("select");
    }

    const handleSinglePromptChange = debounce((id, text) => {
        let weightedPrompts = { ...$activePrompt.weightedPrompts };

        if (!text) {
            const weightedPromptsById = Object.entries(
                $activePrompt.weightedPrompts
            );
            const newPrompts = weightedPromptsById
                .filter(([wpId]) => wpId !== id)
                .map(([wpId, wp]) => [wp.text, wp.parsedWeight]);

            return handleSignificantPromptChange(newPrompts);
        }
        const updatedWP = { ...weightedPrompts[id], text };
        weightedPrompts[id] = updatedWP;

        activePrompt.update({
            ...$activePrompt,
            weightedPrompts,
        });
    }, 1000);

    const handleNewPromptChange = debounce((text) => {
        const newPrompts = Object.entries($activePrompt.weightedPrompts).map(
            ([wpId, wp]) => [wp.text, wp.parsedWeight]
        );

        newPrompts.push([text, 1]);

        return handleSignificantPromptChange(newPrompts);
    }, 1000);
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
