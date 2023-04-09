<script lang="ts">
    import { activePrompt } from "../stores/activePromptStore.js";
    import { showZeroPrompts } from "../stores/showZeroPrompts.js";
    import { useWeightOrdering } from "../stores/useWeightOrdering";
    import { getPromptText } from "$lib/prompt";
    import { outputMultiPrompt } from "../stores/outputMultiPrompt.js";
    import { seed } from "../stores/slotSets";
</script>

<div class="overflow-y-auto h-full">
    <p class="text-sm select-none">
        <span style={`color: rgba(255,255,255,0.75});`}
            >{getPromptText(
                $activePrompt,
                $seed,
                $outputMultiPrompt,
                $useWeightOrdering,
                $showZeroPrompts
            )}
        </span>
    </p>
</div>
