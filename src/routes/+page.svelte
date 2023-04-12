<script lang="ts">
    import MainView from "../mainview/MainView.svelte";
    import SideberPanel from "../sidebar/SidebarPanel.svelte";

    let innerWidth: number | null = null;
    let innerHeight: number | null = null;
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#if innerWidth && innerHeight && innerWidth > 1024 && innerHeight > 800}
    <SideberPanel />
    <MainView />
{:else if innerWidth && innerHeight}
    <p class="text-lg">
        This tool is not optimized for small screens or mobile devices.
    </p>
{:else}
    <p class="text-lg">
        Loading...
    </p>
{/if}
