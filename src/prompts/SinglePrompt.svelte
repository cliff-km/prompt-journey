<script lang="ts">
    import { activePrompt } from "../stores/activePromptStore.js";
    import { showZeroPrompts } from "../stores/showZeroPrompts.js";
    import { useWeightOrdering } from "../stores/useWeightOrdering";
    import { getPromptList, getPromptText } from "$lib/prompt";
    import { outputMultiPrompt } from "../stores/outputMultiPrompt.js";
</script>

<div class="overflow-y-auto h-full">
    <p class="text-sm select-none">
        <span style={`color: rgba(255,255,255,0.75});`}
            >{getPromptText(
                $activePrompt,
                $outputMultiPrompt,
                $useWeightOrdering,
                $showZeroPrompts
            )}
        </span>
    </p>
</div>
