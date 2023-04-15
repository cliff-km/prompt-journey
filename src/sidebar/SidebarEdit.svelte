<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import { processString } from "../lib/prompt.js";
    import { promptStore } from "../stores/prompt.js";
    import { concepts } from "../stores/concepts.js";
    import {
        intializeActivePrompt,
        activePrompt,
        createWeightedPrompt,
    } from "../stores/activePrompt.js";
    import { panelMode } from "../stores/panelMode.js";
    import { selectedPrompt } from "../stores/selectedPrompt.js";
    import debounce from "lodash/debounce";

    let newPromptText = "";
    let promptCount = Object.keys($activePrompt.weightedPrompts).length;
    let shiftDown = false;

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

                if (!$concepts[text]) {
                    concepts.update(text as string, null);
                }
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

    function handlePromptRemove(id) {
        console.log("remove", id);
        const weightedPromptsById = Object.entries(
            $activePrompt.weightedPrompts
        );
        const newPrompts = weightedPromptsById
            .filter(([wpId]) => wpId !== id)
            .map(([wpId, wp]) => [wp.text, wp.parsedWeight]);

        return handleSignificantPromptChange(newPrompts);
    }

    function handleSinglePromptChange(id: number, text: string) {
        console.log("change", id);
        let weightedPrompts = { ...$activePrompt.weightedPrompts };

        const updatedWP = { ...weightedPrompts[id], text };
        weightedPrompts[id] = updatedWP;

        activePrompt.update({
            ...$activePrompt,
            weightedPrompts,
        });
    }

    const debouncedUpdate = debounce(handleSinglePromptChange, 500);

    function handleNewPromptChange(text: string) {
        console.log("new", text);
        const newPrompts = Object.entries($activePrompt.weightedPrompts).map(
            ([wpId, wp]) => [wp.text, wp.parsedWeight]
        );

        newPrompts.push([text, 1]);

        return handleSignificantPromptChange(newPrompts);
    }

    function handleKeyDown(e, id = null) {
        const keypress = e.key;
        const text = e.target.value;

        if (keypress === "Shift") {
            shiftDown = true;
            return;
        }

        if (id !== null) {
            if (keypress === "Enter" && text !== "") {
                handleSinglePromptChange(id, text);
            } else if (keypress === "Backspace" && text === "") {
                handlePromptRemove(id);
            }
            
            if (keypress === "Enter" && shiftDown) {
                const weightedPromptsById = Object.entries($activePrompt.weightedPrompts);
                const newPrompts = weightedPromptsById.map(([wpId, wp]) => [
                    wp.text,
                    wp.parsedWeight,
                ]);

                const newPromptId = parseInt(id)+1

                console.log("adding prompt at", id+1)
                newPrompts.splice(newPromptId, 0, ["", 1]);

                return handleSignificantPromptChange(newPrompts);
            }
        } else if (keypress === "Enter" && text !== "") {
            handleNewPromptChange(text);
        }
    }
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
                on:input={(e) => debouncedUpdate(id, e.target.value)}
                on:keydown={(e) => handleKeyDown(e, id)}
                on:keyup={(e) => {
                    if (e.key === "Shift") shiftDown = false;
                }}
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
            on:keydown={(e) => handleKeyDown(e)}
            placeholder="Add prompt"
            class="input input-bordered input-sm w-full italic"
        />
    </li>
</ul>
<div class="w-full justify-end bg-base-100 p-2 text-xs select-none">
    <p>Shift+Enter to add a line</p>
    <p>Bksp to remove an empty line</p>
</div>