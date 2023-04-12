<script lang="ts">
    import { ConceptMode } from "../types";
    import { conceptMode } from "../stores/conceptMode";
    import ConceptMap from "../embeds/ConceptMap.svelte";
    import ConceptList from "../embeds/ConceptList.svelte";
</script>

{#if $conceptMode === ConceptMode.List}
    <ConceptList />
{:else if $conceptMode === ConceptMode.Map}
    <ConceptMap />
{/if}
