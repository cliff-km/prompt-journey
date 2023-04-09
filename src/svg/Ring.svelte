<script lang="ts">
    import type { Vec2 } from "../types";

    export let xy = [500, 500] as Vec2;
    export let radius = 400;
    export let stroke = 20;
    export let color = "rgba(46,67,101, 0.4)";
</script>

<g>
    <circle
        cx={xy[0]}
        cy={xy[1]}
        r={radius}
        stroke={color}
        stroke-width={stroke}
        style:fill="rgba(0,0,0,0)"
    />
</g>
