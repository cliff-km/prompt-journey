<script>
    export let p1 = [100, 100];
    export let p2 = [100, 100];
    export let stroke = 2;
    export let color = 'rgba(46,67,101, 0.4)';
</script>

<line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} stroke={color} stroke-dasharray="10,10" stroke-width={stroke} />