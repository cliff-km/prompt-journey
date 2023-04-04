<script lang="ts">
    export let xy = [100, 100];
    export let wh = [100, 100];
    export let text = "";
    export let color = "rgba(96,117,151, 1)";
    export let textAlign = "center";
    export let fontSize = 11;
</script>

<foreignObject x={xy[0]} y={xy[1]} width={wh[0]} height={wh[1]}>
    <div class="h-full flex flex-col justify-center">
        <p
            style:color={color}
            style:user-select="none"
            style:margin="0"
            style:pointer-events="none"
            style:text-align={textAlign}
            style:font-size={fontSize + "px"}
            style:font-family="sans-serif"
            style:font-style="italic"
        >
            {text}
        </p>
    </div>
</foreignObject>

<style>
    .small {
        font: italic 13px sans-serif;
    }
    .heavy {
        font: bold 30px sans-serif;
    }
</style>
