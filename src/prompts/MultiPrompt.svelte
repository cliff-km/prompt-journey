<script lang="ts">
    import { getDisplayWeight, getRelativeWeight } from "$lib/weights.js";
    import { activePrompt } from "../stores/activePromptStore.js";
    import { showZeroPrompts } from "../stores/showZeroPrompts.js";
    import { useWeightOrdering, } from "../stores/useWeightOrdering";
    import { getPromptList } from "$lib/prompt";
</script>

<div class="overflow-y-auto h-full">
    <p class="text-sm select-none">
        {#each getPromptList($activePrompt, $useWeightOrdering, $showZeroPrompts) as [id, wp] (id)}<span
                style={`color: rgba(255,255,255,${Math.max(
                    0.25,
                    getRelativeWeight($activePrompt, parseInt(id))
                )});`}
                >{wp.text}::<b
                    >{getDisplayWeight($activePrompt, parseInt(id))}
                </b></span
            >
        {/each}
    </p>
</div>
