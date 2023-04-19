<script lang="ts">
    import type { Vec2 } from "../types";
    import { findBoxCenter } from "$lib/vector";
    import RandomControllerWidget from "./RandomControllerWidget.svelte";
    import PromptBox from "../prompts/PromptBox.svelte";
    let controllerW: number;
    let controllerH: number;

    $: wh = [controllerW || 0, controllerH || 0] as Vec2;
    $: center = findBoxCenter(wh);
</script>

<div
    class="w-full h-full pt-10"
    bind:clientWidth={controllerW}
    bind:clientHeight={controllerH}
>
    <RandomControllerWidget dimensions={wh} center={center}>
        <PromptBox />
    </RandomControllerWidget>
</div>
