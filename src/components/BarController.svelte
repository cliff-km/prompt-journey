<script lang="ts">
    import BarControllerWidget from "./BarControllerWidget.svelte";
    let controllerW;
    let controllerH;
</script>

<div
    class="w-full h-full"
    bind:clientWidth={controllerW}
    bind:clientHeight={controllerH}
>
    <BarControllerWidget />
</div>
