<script lang="ts">
    import { activePrompt } from "../stores/activePrompt.js";
    import { showZeroPrompts } from "../stores/showZeroPrompts.js";
    import { useWeightOrdering } from "../stores/useWeightOrdering";
    import { getPromptText } from "$lib/prompt";
    import { outputMode } from "../stores/outputMode.js";
    import { seed } from "../stores/slotSets";
    import { promptText } from "../stores/promptText";
    import { createChatCompletion, createOpenAI } from "$lib/openai.js";
    import { key } from "../stores/key";
    import { debounce } from "lodash";
    import { onDestroy, onMount } from "svelte";

    export let promptPromise = null;

    async function getPrompt(ap) {
        const openai = createOpenAI($key);

        //get prompt text and only keep first 15 lines
        const promptText = getPromptText(
            ap,
            $seed,
            $outputMode,
            $useWeightOrdering,
            $showZeroPrompts
        )
            .split("\n")
            .slice(0, 15)
            .join("\n");

        const completion = await createChatCompletion(
            openai,
            `
        The structure of an image prompt is: 
        subject of the image, styles of the image, genres of the image, medias of the image
        For example:
        a cat walking through the desert, in the style of Wes Anderson, in the style of Van Gogh, desertpunk, solarpunk, movie still

        Combine the following list of image prompts into a single image prompt. If there are multiple prompts try to find a common theme to create a single prompt.
        
        ${promptText}
        `
        );

        console.log(completion.data.choices);

        return completion.data.choices[0].message.content;
    }

    const handlePromptChange = debounce(async (ap) => {
        if(!$key) return;
        promptPromise = getPrompt(ap);
        promptPromise.then((prompt) => {
            console.log("updating magic prompt text");
            promptText.set(prompt);
        });
    }, 1000);

    const unsubscribe = activePrompt.subscribe(handlePromptChange);

    onMount(() => {
        if(!$key) return;
        promptPromise = getPrompt($activePrompt).then((prompt) => {
            console.log("updating magic prompt text");
            promptText.set(prompt);
        });
    });

    onDestroy(() => {
        unsubscribe();
    });
</script>

<div class="overflow-y-auto h-full">
    <p class="text-sm select-none">
        {#if !$key}
            Requires OpenAI key, please enter one in the settings menu.
        {:else}
            {#await promptPromise}
                Regenerating...
            {:then prompt}
                <span style={`color: rgba(255,255,255,0.75});`}>{prompt} </span>
            {/await}
        {/if}
    </p>
</div>
