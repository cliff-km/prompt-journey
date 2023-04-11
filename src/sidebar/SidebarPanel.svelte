<script lang="ts">
    import SidebarSelect from "./SidebarSelect.svelte";
    import SidebarEdit from "./SidebarEdit.svelte";
    import SidebarGenerate from "./SidebarGenerate.svelte";
    import SidebarSettings from "./SidebarSettings.svelte";
    import { panelModeStore, panelMode } from "../stores/panelModeStore.js";
    import IconGear from "../icon/IconGear.svelte";
    import SidebarSlots from "./SidebarSlots.svelte";

    $: {
        if(!$panelMode) panelModeStore.update("select");
    }

    function selectPanelMode(mode: string) {
        panelModeStore.update(mode);
    }
</script>

<div class="max-w-md w-1/2 h-screen">
    <div class="h-screen overflow-y-auto flex flex-col">
        <div
            class="btn-group btn-group-vertical sm:btn-group-horizontal bg-base-100 w-full flex justify-center p-2"
        >
            <button
                class={$panelMode === "select" ? "btn btn-active" : "btn"}
                on:click={() => selectPanelMode("select")}>Select</button
            >
            <button
                class={$panelMode === "edit" ? "btn btn-active" : "btn"}
                on:click={() => selectPanelMode("edit")}>Edit</button
            >
            <button
                class={$panelMode === "generate" ? "btn btn-active" : "btn"}
                on:click={() => selectPanelMode("generate")}>Generate</button
            >
            <button
                class={$panelMode === "slots" ? "btn btn-active" : "btn"}
                on:click={() => selectPanelMode("slots")}>Slots</button
            >
            <button
                class={$panelMode === "settings" ? "btn btn-active" : "btn"}
                on:click={() => selectPanelMode("settings")}><IconGear /></button
            >
        </div>
        <!-- Sidebar content here -->
        {#if $panelMode === "select"}
            <SidebarSelect />
        {:else if $panelMode === "edit"}
            <SidebarEdit />
        {:else if $panelMode === "generate"}
            <SidebarGenerate />
        {:else if $panelMode === "slots"}
            <SidebarSlots />
        {:else if $panelMode === "settings"}
            <SidebarSettings />
        {/if}
    </div>
</div>
