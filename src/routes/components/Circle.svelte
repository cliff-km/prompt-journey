<script lang="ts">
    export let xy = [500, 500];
    export let radius = 400;
    export let stroke = 2;
    export let color = 'rgba(46,67,101, 0.4)';
</script>

<circle cx={xy[0]} cy={xy[1]} r={radius} stroke={color} stroke-width={stroke} style:fill="rgba(0,0,0,0)" />