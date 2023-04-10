<script lang="ts">
    import type { Vec2 } from "../types";
    import { polarToPoint } from "$lib/circle";

    export let xy = [500, 500] as Vec2;
    export let radius = 400;
    export let stroke = 20;
    export let color = "rgba(46,67,101, 0.4)";
    export let hoverColor = "white";
    export let angle = 0;
    export let handleMouseDown = (e: Event) => {};
    export let reverse = false;

    let c = color;

    $: ipBack = polarToPoint(
        xy,
        [-4, 1],
        radius - stroke / 2
    );
    $: ipFront = polarToPoint(
        xy,
        [1, 1],
        radius - stroke / 2
    );
    $: apBack = polarToPoint(
        xy,
        [0, 1],
        radius
    );
    $: apFront = polarToPoint(
        xy,
        [4, 1],
        radius
    );
    $: opBack = polarToPoint(
        xy,
        [-3, 1],
        radius + stroke / 2
    );
    $: opFront = polarToPoint(
        xy,
        [1, 1],
        radius + stroke / 2
    );

    function handleMouseOver() {
        c = hoverColor;
    }
    function handleMouseOut() {
        c = color;
    }
    function _handleMouseDown(e: Event) {
        handleMouseDown(e);
    }
</script>

<polygon
    points={`${apBack[0]},${apBack[1]} ${ipBack[0]},${ipBack[1]} ${ipFront[0]},${ipFront[1]} ${apFront[0]},${apFront[1]} ${opFront[0]},${opFront[1]} ${opBack[0]},${opBack[1]}`}
    stroke-width={4}
    fill={c}
    transform={`rotate(${angle.toFixed(2)} ${xy[0]} ${xy[1]}) rotate(${reverse ? '180' : '0'} ${(apBack[0] + apFront[0])/2} ${(apBack[1] + apFront[1])/2})`}
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
    on:mousedown={_handleMouseDown}
    on:touchstart={_handleMouseDown}
/>