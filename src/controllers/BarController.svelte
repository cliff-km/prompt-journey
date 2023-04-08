<script lang="ts">
    import type { Vec2 } from "../types";
    import { findBoxCenter } from "$lib/vector";
    import BarControllerWidget from "./BarControllerWidget.svelte";
    let controllerW: number;
    let controllerH: number;

    $: wh = [controllerW || 0, controllerH || 0] as Vec2;
    $: center = findBoxCenter(wh);
</script>

<div
    class="w-full h-full"
    bind:clientWidth={controllerW}
    bind:clientHeight={controllerH}
>
    <BarControllerWidget dimensions={wh} center={center} />
</div>
