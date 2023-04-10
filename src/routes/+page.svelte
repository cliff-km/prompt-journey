<script lang="ts">
    import { e } from "mathjs";
import ControllerView from "../controllers/ControllerView.svelte";
    import SideberPanel from "../sidebar/SidebarPanel.svelte";

    let innerWidth = 0
    let innerHeight = 0

</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#if innerWidth > 1024 && innerHeight > 800}
<SideberPanel />
<ControllerView />
{:else}
    <p class="text-lg">This tool is not optimized for small screens or mobile devices.</p>
{/if}