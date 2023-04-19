<script lang="ts">
    import PromptBox from "../prompts/PromptBox.svelte";
    import PieControllerWidget from "./PieControllerWidget.svelte";

    let controllerW;
    let controllerH;
</script>

<div
    class="w-full h-full"
    bind:clientWidth={controllerW}
    bind:clientHeight={controllerH}
>
    <PieControllerWidget
        center={[Math.round(controllerW / 2), Math.round(controllerH / 2)]}
        radius={Math.round(Math.min(controllerW, controllerH) / 2) - 150}
        
    />
</div>
<PromptBox />
