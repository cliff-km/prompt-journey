<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import { ClarinetPuppet1 } from "../directives/clarinet-puppet-1";
    import { ClarinetPuppet2 } from "../directives/clarinet-puppet-2";
    import { FiveSentences } from "../directives/five-sentences";
    import { TenSentences } from "../directives/ten-sentences";
    import { Fragments } from "../directives/fragments";
    import { FragmentShotgun } from "../directives/fragment-shotgun";
    import { PoeticAccents } from "../directives/poetic-accent";
    import { directiveStore, directiveList } from "../lib/directiveStore.js";
    import {
        preferredModelStore,
        preferredModel,
    } from "../lib/prefferedModelStore.js";
    import {
        preferredDirectiveStore,
        preferredDirective,
    } from "../lib/prefferedDirectiveStore.js";
    import { metaPromptStore, metaPrompt } from "../lib/metaPromptStore.js";
    import {
        createOpenAI,
        createCompletion,
        createChatCompletion,
    } from "../lib/openai.js";
    import { panelModeStore, panelMode } from "../lib/panelModeStore.js";
    import { intializeActivePrompt, activePromptStore, activePrompt, createWeightedPrompt } from "../lib/activePromptStore";
    import { key } from "../lib/keyStore.js";
    import { processString } from "../lib/prompt.js";

    let openaiKey = $key;
    let selectedModel = $preferredModel;

    const chatModels = ["gpt-3.5-turbo", "gpt-3.5-turbo-0301"];

    const insertModels = [
        "text-davinci-003",
        "text-curie-001",
        "text-babage-001",
        "text-ada-001",
    ];

    let builtInDirectives = {
        // "A": {name: "Clarinet Puppet 1", text: ClarinetPuppet1, builtIn: true},
        // "B": {name: "Clarinet Puppet 2", text: ClarinetPuppet2, builtIn: true},
        C: { name: "Five Sentences", text: FiveSentences, builtIn: true },
        D: { name: "Ten Sentences", text: TenSentences, builtIn: true },
        E: { name: "Fragments", text: Fragments, builtIn: true },
        F: { name: "Fragment Shotgun", text: FragmentShotgun, builtIn: true },
        G: { name: "Poetic Accents", text: PoeticAccents, builtIn: true },
    };

    $: userDirectives = $directiveList.reduce((acc, [id, data]) => {
        acc[id] = { name: data.name, text: data.text, builtIn: false };
        return acc;
    }, {});

    $: directives = Object.entries({
        ...builtInDirectives,
        ...userDirectives,
    }).reduce((acc, [id, data]) => {
        acc[id] = data;
        return acc;
    }, {});

    let selectedDirective = null;
    let newPromptName = "";
    let directiveText = "";

    function saveToStore() {
        const id = selectedDirective === "new" ? uuidv4() : selectedDirective;
        directiveStore.updateDirective(id, {
            name: newPromptName,
            text: directiveText,
            builtIn: false,
        });

        if (selectedDirective === "new") {
            selectedDirective = id;
        }
    }

    $: {
        if (selectedDirective === null) {
            selectedDirective = $preferredDirective;
        }
        updateDirective(selectedDirective);
    }

    function deleteFromStore() {
        directiveStore.deleteDirective(selectedDirective);
        selectedDirective = null;
    }

    function updateDirective(newDirective) {
        selectedDirective = newDirective;
        preferredDirectiveStore.updateDirectiveKey(newDirective);
        if (newDirective && newDirective !== "new") {
            newPromptName = directives[newDirective].name;
            directiveText = directives[newDirective].text;
        } else if (newDirective === "new") {
            newPromptName = "";
            directiveText = "";
        }
    }

    function handleSelectedDirectiveChange(e) {
        selectedDirective = e.target.value;
        updateDirective(selectedDirective);
    }

    function handleChatPrompt(openai, instructions) {
        const model = selectedModel || "gpt-3.5-turbo";
        const completion = createChatCompletion(openai, model, instructions);
        completion.then((response) => {
            console.log(response);

            response.data.choices.forEach((choice, i) => {
                const sentences = processString(choice.message.content);
                console.log(sentences);

                const weightedPrompts = sentences.reduce((acc, [text, parsedWeight], idx) => {
                    acc[idx] = createWeightedPrompt(idx, text, parsedWeight);
                    return acc;
                }, {});

                activePromptStore.updateActivePrompt(intializeActivePrompt(weightedPrompts));
                panelModeStore.updateMode("edit");
            });
        });
    }

    function handleInsertPrompt(openai, instructions) {
        const model = selectedModel || "text-davinci-003";
        const completion = createCompletion(openai, model, instructions);
        completion.then((response) => {
            console.log(response);

            response.data.choices.forEach((choice, i) => {
                const sentences = processString(choice.text); // insert
                console.log(sentences);

                const weightedPrompts = sentences.reduce((acc, [text, parsedWeight], idx) => {
                    acc[idx] = createWeightedPrompt(idx, text, parsedWeight);
                    return acc;
                }, {});

                activePromptStore.updateActivePrompt(intializeActivePrompt(weightedPrompts));
                panelModeStore.updateMode("edit");
            });
        });
    }

    function handleGeneratePrompt() {
        if (!openaiKey) {
            return;
        }
        if (!directiveText) {
            return;
        }
        if (!$metaPrompt) {
            return;
        }
        const openai = createOpenAI(openaiKey);

        const instructions = `${directiveText}

        Using the above rules create a prompt from:
        ${$metaPrompt}
        `;

        if (insertModels.includes(selectedModel)) {
            handleInsertPrompt(openai, instructions);
        } else {
            handleChatPrompt(openai, instructions);
        }
    }

    $: builtInDirective =
        selectedDirective &&
        selectedDirective !== "new" &&
        directives[selectedDirective].builtIn;
    $: isUserDirective =
        selectedDirective &&
        selectedDirective !== "new" &&
        !directives[selectedDirective].builtIn;
</script>

<div
    class="h-full p-2 w-full bg-base-100 overflow-y-auto text-base-content inline-block"
>
    {#if openaiKey}
        <div class="flex justify-center">
            <div class="form-control w-full max-w-xs mb-4">
                <label class="label">
                    <span class="label-text"
                        >Pick a directive for prompt creation</span
                    >
                </label>
                <select
                    value={selectedDirective}
                    on:change={handleSelectedDirectiveChange}
                    class="select select-bordered"
                >
                    <option disabled selected={selectedDirective === null}
                        >Pick one</option
                    >
                    {#each Object.entries(directives) as [id, data] (id)}
                        <option value={id} selected={selectedDirective === id}
                            >{data.name}{data.builtIn
                                ? " (Built-In)"
                                : " (User)"}</option
                        >
                    {/each}
                    <option value="new" selected={selectedDirective === "new"}
                        >New</option
                    >
                </select>
            </div>
        </div>
        {#if selectedDirective}
            {#if !builtInDirective}
                <div class="w-full p-2 h-12 flex justify-between">
                    <input
                        bind:value={newPromptName}
                        type="text"
                        placeholder="Name"
                        class="input input-bordered input-sm w-full max-w-xs"
                    />
                    <button
                        on:click={saveToStore}
                        class="btn btn-sm btn-primary ml-4">Save</button
                    >
                </div>
            {/if}
            <div class="w-full p-2 h-1/2">
                <textarea
                    bind:value={directiveText}
                    class="textarea textarea-bordered w-full h-full"
                    placeholder="GPT Directives"
                />
            </div>
            <div class="w-full p-2 h-1/5">
                <textarea
                    value={$metaPrompt}
                    on:input={(e) =>
                        metaPromptStore.updateMetaPrompt(e.target.value)}
                    class="textarea textarea-bordered w-full h-full"
                    placeholder="Describe the prompt to generate."
                />
            </div>
            {#if isUserDirective}
                <div class="w-full p-2 h-12 flex justify-between">
                    <button
                        on:click={deleteFromStore}
                        class="btn btn-sm btn-error ml-4">Delete</button
                    >
                    <button
                        on:click={handleGeneratePrompt}
                        class="btn btn-sm btn-primary ml-4">Generate</button
                    >
                </div>
            {:else}
                <div class="w-full p-2 h-12 flex justify-end">
                    <button
                        on:click={handleGeneratePrompt}
                        class="btn btn-sm btn-primary ml-4">Generate</button
                    >
                </div>
            {/if}
        {/if}
    {:else}
        <div class="w-full p-2 flex justify-center">
            <p>Open AI Key must be provided in settings.</p>
        </div>
    {/if}
</div>
