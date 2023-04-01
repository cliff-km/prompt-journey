<script>
    export let xy = [100, 100];
    export let radius = 25;
    export let textColor = 'rgba(96,117,151, 1)';
    export let bgColor = 'black';
    export let weight = '';
</script>

<circle cx={xy[0]} cy={xy[1]} r={radius} style:fill={bgColor}/>
<foreignObject x={xy[0]-radius} y={xy[1]-radius} width={radius*2} height={radius*2}>
    <p style="color:{textColor}; user-select: none; margin: 0;" xmlns="http://www.w3.org/1999/xhtml" class="heavy">{weight}</p>
</foreignObject>

<style>
    .small {
        font: italic 13px sans-serif;
    }
    .heavy {
        font: bold 20px sans-serif;
    }
</style>