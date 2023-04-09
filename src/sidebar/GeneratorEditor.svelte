<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import { ClarinetPuppet1 } from "../directives/clarinet-puppet-1";
    import { ClarinetPuppet2 } from "../directives/clarinet-puppet-2";
    import { FiveSentences } from "../directives/five-sentences";
    import { TenSentences } from "../directives/ten-sentences";
    import { Fragments } from "../directives/fragments";
    import { FragmentShotgun } from "../directives/fragment-shotgun";
    import { PoeticAccents } from "../directives/poetic-accent";
    import { directiveStore, directiveList } from "../stores/directiveStore.js";
    import {
        preferredDirectiveStore,
        preferredDirective,
    } from "../stores/preferredDirectiveStore.js";
    import { metaPromptStore, metaPrompt } from "../stores/metaPromptStore.js";
    import { seed } from "../stores/slotSets";
    import { directiveText } from "../stores/directiveText";
    import { instructions, createInstructions } from "../stores/instructions";

    export let togglePreview = ()=>{};
    export let isGenerating = false;
    export let handleGeneratePrompt = ()=>{};

    let builtInDirectives = {
        // "A": {name: "Clarinet Puppet 1", text: ClarinetPuppet1, builtIn: true},
        // "B": {name: "Clarinet Puppet 2", text: ClarinetPuppet2, builtIn: true},
        C: { name: "Five Sentences", text: FiveSentences, builtIn: true },
        D: { name: "Ten Sentences", text: TenSentences, builtIn: true },
        E: { name: "Fragments", text: Fragments, builtIn: true },
        F: { name: "Concept Shotgun", text: FragmentShotgun, builtIn: true },
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

    $: {
        if (selectedDirective === null && $preferredDirective) {
            selectedDirective = $preferredDirective;
            updateDirective(selectedDirective);
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


    function saveToStore() {
        const id = selectedDirective === "new" ? uuidv4() : selectedDirective;
        directiveStore.update(id, {
            name: newPromptName,
            text: $directiveText,
            builtIn: false,
        });

        if (selectedDirective === "new") {
            selectedDirective = id;
            preferredDirectiveStore.update(id);
        }
    }

    function deleteFromStore() {
        directiveStore.delete(selectedDirective);
        selectedDirective = null;
        newPromptName = "";
        directiveText.set("");
        preferredDirectiveStore.delete();
    }

    function updateDirective(newDirective) {
        selectedDirective = newDirective;
        preferredDirectiveStore.update(newDirective);
        if (newDirective && newDirective !== "new") {
            newPromptName = directives[newDirective].name;
            directiveText.set(directives[newDirective].text);
            instructions.set(createInstructions($directiveText, $metaPrompt));
        } else if (newDirective === "new") {
            newPromptName = "";
            directiveText.set("");
            instructions.set(createInstructions($directiveText, $metaPrompt));
        }
    }

    function handleSelectedDirectiveChange(e) {
        updateDirective(e.target.value);
    }
</script>


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
            bind:value={$directiveText}
            class="font-mono text-xs textarea textarea-bordered w-full h-full resize-none"
            placeholder="GPT Directives"
        />
    </div>
    <div class="w-full p-2 h-1/5">
        <textarea
            value={$metaPrompt}
            on:input={(e) => metaPromptStore.update(e.target.value)}
            class="textarea textarea-bordered w-full h-full resize-none"
            placeholder="Describe the prompt to generate."
        />
    </div>
    <div class="w-full p-2 h-12 flex justify-between">
        {#if isUserDirective}
            <button
                on:click={deleteFromStore}
                class="btn btn-sm btn-error">Delete</button
            >
        {/if}
        <button on:click={togglePreview} class="btn btn-sm btn btn-info">Preview</button>
        {#if isGenerating}
            <button class="btn btn-sm btn disabled"
                >Generating</button
            >
        {:else}
            <button
                on:click={handleGeneratePrompt}
                class="btn btn-sm btn-primary">Generate</button
            >
        {/if}
    </div>
{/if}