<script lang="ts">
    export let xy = [100, 100];
    export let radius = 5;
    export let color = "black";
    export let hoverColor = "white";
    export let handleMouseDown = (e: Event) => {};

    let c = color;

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

<circle
    cx={xy[0]}
    cy={xy[1]}
    r={radius}
    style:fill={c}
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
    on:mousedown={_handleMouseDown}
    on:touchstart={_handleMouseDown}
/>
