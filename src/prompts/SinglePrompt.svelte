<script lang="ts">
    import { activePrompt } from "../stores/activePrompt.js";
    import { showZeroPrompts } from "../stores/showZeroPrompts.js";
    import { useWeightOrdering } from "../stores/useWeightOrdering";
    import { getPromptText } from "$lib/prompt";
    import { outputMode } from "../stores/outputMode.js";
    import { seed } from "../stores/slotSets";
    import { promptText } from "../stores/promptText";

    $: {
        console.log("updating single prompt text");
        promptText.set(
            getPromptText(
                $activePrompt,
                $seed,
                $outputMode,
                $useWeightOrdering,
                $showZeroPrompts
            )
        );
    }
</script>

<div class="overflow-y-auto h-full">
    <p class="text-sm select-none">
        <span style={`color: rgba(255,255,255,0.75});`}>{$promptText}</span>
    </p>
</div>
