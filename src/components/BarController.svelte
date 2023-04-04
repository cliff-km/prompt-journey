<script lang="ts">
    import { findBoxCenter } from "$lib/vector";
    import BarControllerWidget from "./BarControllerWidget.svelte";
    let controllerW;
    let controllerH;

    $: wh =[controllerW || 0, controllerH || 0];
    $: center = findBoxCenter(wh);
</script>

<div
    class="w-full h-full"
    bind:clientWidth={controllerW}
    bind:clientHeight={controllerH}
>
    <BarControllerWidget dimensions={wh} center={center} />
</div>
