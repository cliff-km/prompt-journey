<script lang="ts">
    export let xy = [100, 100];
    export let wh = [100, 100];
    export let text = "";
    export let color = "rgba(96,117,151, 1)";
    export let textAlign = "center";
    export let fontSize = 12;
</script>

<foreignObject x={xy[0]} y={xy[1]} width={wh[0]} height={wh[1]}>
    <div class="h-full flex flex-col justify-center">
        {#if text.startsWith("http")}
            <img
                style:user-select="none"
                src={text}
                style:width="100%"
                style:height="100%"
                style:object-fit="contain"
            />
        {:else}
            <p
                style:color
                style:user-select="none"
                style:margin="0"
                style:pointer-events="none"
                style:text-align={textAlign}
                style:font-size={`${fontSize}px`}
                style:font-family="sans-serif"
                style:font-style="italic"
            >
                {text}
            </p>
        {/if}
    </div>
</foreignObject>
