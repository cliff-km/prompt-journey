<script lang="ts">
    import GeneratorEditor from "./GeneratorEditor.svelte";
    import GeneratorPreview from "./GeneratorPreview.svelte";
    import { key } from "../stores/key";
    import { replaceAliasesWithSlotValue } from "$lib/slots";
    import {
        createOpenAI,
        createCompletion,
        createChatCompletion,
    } from "../lib/openai";
    import { panelMode } from "../stores/panelMode";
    import {
        intializeActivePrompt,
        activePrompt,
        createWeightedPrompt,
    } from "../stores/activePrompt";
    import { processString } from "../lib/prompt";
    import { seed } from "../stores/slotSets";
    import { preferredModel } from "../stores/preferredModel";
    import { metaPrompt } from "../stores/metaPrompt";
    import { directiveText } from "../stores/directiveText";
    import { dealiasedInstructions } from "../stores/instructions";

    const chatModels = ["gpt-3.5-turbo", "gpt-3.5-turbo-0301"];

    const insertModels = [
        "text-davinci-003",
        "text-curie-001",
        "text-babage-001",
        "text-ada-001",
    ];

    let isGenerating = false;
    let openaiKey = $key;
    let previewMode = false;
    $: selectedModel = $preferredModel || null;

    function handleChatPrompt(openaiKey: string, instructions: string) {
        const openai = createOpenAI(openaiKey);
        const model = selectedModel || "gpt-3.5-turbo";
        isGenerating = true;
        createChatCompletion(openai, instructions, model)
            .then((response) => {
                console.log(response);

                response.data.choices.forEach((choice, i) => {
                    const sentences = processString(choice.message.content);
                    console.log(sentences);

                    const weightedPrompts = sentences.reduce(
                        (acc, [text, parsedWeight], idx) => {
                            acc[idx] = createWeightedPrompt(
                                idx,
                                text,
                                parsedWeight
                            );
                            return acc;
                        },
                        {}
                    );

                    activePrompt.update(
                        intializeActivePrompt(
                            weightedPrompts,
                            $activePrompt.weightMode
                        )
                    );
                    panelMode.update("edit");
                    seed.shuffle();
                });
            })
            .finally(() => {
                isGenerating = false;
            });
    }

    function handleInsertPrompt(openaiKey: string, instructions: string) {
        const openai = createOpenAI(openaiKey);
        const model = selectedModel || "text-davinci-003";
        isGenerating = true;
        createCompletion(openai, instructions, model)
            .then((response) => {
                console.log(response);

                response.data.choices.forEach((choice, i) => {
                    const sentences = processString(choice.text); // insert
                    console.log(sentences);

                    const weightedPrompts = sentences.reduce(
                        (acc, [text, parsedWeight], idx) => {
                            acc[idx] = createWeightedPrompt(
                                idx,
                                text,
                                parsedWeight
                            );
                            return acc;
                        },
                        {}
                    );

                    activePrompt.update(
                        intializeActivePrompt(
                            weightedPrompts,
                            $activePrompt.weightMode
                        )
                    );
                    panelMode.update("edit");
                    seed.shuffle();
                });
            })
            .finally(() => {
                isGenerating = false;
            });
    }

    function handleGeneratePrompt() {
        if (!openaiKey) {
            return;
        }

        if (insertModels.includes(selectedModel)) {
            handleInsertPrompt(openaiKey, $dealiasedInstructions);
        } else {
            handleChatPrompt(openaiKey, $dealiasedInstructions);
        }
    }

    function togglePreview() {
        console.log($dealiasedInstructions);
        previewMode = !previewMode;
    }
</script>

<div
    class="h-full p-2 w-full bg-base-100 overflow-y-auto text-base-content inline-block"
>
    {#if openaiKey}
        {#if previewMode}
            <GeneratorPreview
                {togglePreview}
                {handleGeneratePrompt}
                {isGenerating}
            />
        {:else}
            <GeneratorEditor
                {togglePreview}
                {handleGeneratePrompt}
                {isGenerating}
            />
        {/if}
    {:else}
        <div class="w-full p-2 flex justify-center">
            <p class="text-center">
                Set Open AI Key in settings for GPT generation.
            </p>
        </div>
    {/if}
</div>
