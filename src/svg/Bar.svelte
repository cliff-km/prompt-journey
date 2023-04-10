<script lang="ts">
    export let xy = [500, 500];
    export let wh = [100, 100];
    export let color = "rgba(46,67,101, 0.4)";

    export let handleMouseDown = (e: Event) => {};
    export let handleMouseOver = (e: Event) => {};
    export let handleMouseOut = (e: Event) => {};
</script>

<rect
    x={xy[0]}
    y={xy[1]}
    width={Math.max(wh[0], 0)}
    height={Math.max(wh[1], 0)}
    style:fill={color}
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
    on:mousedown={handleMouseDown}
    on:touchstart={handleMouseDown}
/>
