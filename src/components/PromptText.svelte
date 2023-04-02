<script lang="ts">
    export let xy = [100, 100];
    export let wh = [100, 100];
    export let text = "";
    export let color = 'rgba(96,117,151, 1)';
</script>

<foreignObject x={xy[0]} y={xy[1]} width={wh[0]} height={wh[1]}>
    <p style="color:{color}; user-select: none; margin: 0; pointer-events:none;" class="small">{text}</p>
</foreignObject>

<style>
    .small {
        font: italic 13px sans-serif;
    }
    .heavy {
        font: bold 30px sans-serif;
    }
</style>