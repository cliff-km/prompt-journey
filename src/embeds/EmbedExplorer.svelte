<script lang="ts">
    import type { Vec2, PointData } from "../types";
    import { add, multiply, subtract } from "mathjs";
    import Point from "../svg/Point.svelte";
    import Line from "../svg/DashedLine.svelte";
    import PromptText from "../svg/PromptText.svelte";
    import { getTextBoxDimensions, getDisplayText } from "../lib/text";
    import { getSVGInputLocation } from "../lib/vector";

    // state exports
    export let onMarkerMove = (pos: Vec2) => {};

    // display state
    export let dataPoints : Record<string, PointData>;
    export let center = [100, 100] as Vec2;
    export let dimensions = [100, 100] as Vec2;
    export let pointRadius = 4;
    export let markerRadius = 10;
    export let textWidth = 150;
    export let fontSize = 12;
    export let innerPad = 100;

    // control state
    export let markerLocation = [0.5, 0.5] as Vec2;

    // inner state
    let activePoint: boolean = false;
    let innerDimensions = dimensions;
    let innerOffsets = [0, 0] as Vec2;
    let zoomFactor = 1;
    let zoomOffset = [0, 0] as Vec2;
    let focused = true;

    $: {
        const minDim = Math.min(...dimensions);
        const minIsX = dimensions[0] === minDim;
        const minIsY = dimensions[1] === minDim;
        innerOffsets = [
            Math.max(minIsX ? 0 : (dimensions[0] - minDim) / 2, innerPad),
            Math.max(minIsY ? 0 : (dimensions[1] - minDim) / 2, innerPad),
        ];
        innerDimensions = [
            dimensions[0] - 2 * innerOffsets[0],
            dimensions[1] - 2 * innerOffsets[1],
        ];
    }

    function handleDoubleClick(e: MouseEvent) {
        const mouseLocation = getSVGInputLocation(e);
        markerLocation = getRelativeLocation(
            multiply(
                subtract(mouseLocation, zoomOffset),
                1 / zoomFactor
            ) as Vec2
        );
        onMarkerMove(markerLocation);
    }

    function handleMouseMove(e: MouseEvent | TouchEvent) {
        if (activePoint) {
            const mouseLocation = getSVGInputLocation(e);
            markerLocation = getRelativeLocation(
                multiply(
                    subtract(mouseLocation, zoomOffset),
                    1 / zoomFactor
                ) as Vec2
            );
            onMarkerMove(markerLocation);
        }
    }

    function handleMouseUp(e: Event) {
        activePoint = false;
    }

    function detectTrackPad(e: WheelEvent) {
        var isTrackpad = false;
        if (e.deltaY) {
            if (e.deltaY === e.deltaY * -3) {
                isTrackpad = true;
            }
        } else if (e.deltaMode === 0) {
            isTrackpad = true;
        }
        return isTrackpad;
    }

    function handleMouseWheel(e: WheelEvent) {
        e.preventDefault();
        const trackpad = detectTrackPad(e);

        const mouseLocation = getSVGInputLocation(e);

        // ml = zf * zl + zo
        // zl = (ml - zo) / zf
        const zoomLocation = multiply(
            subtract(mouseLocation, zoomOffset),
            1 / zoomFactor
        ) as Vec2;
        const direction = trackpad ? -1 : 1;

        zoomFactor = Math.min(
            Math.max(zoomFactor + direction * e.deltaY * -0.01, 0.5),
            20
        );

        //zoomOffset should center the zoom on the mouse location and keep it centered as the zoom changes
        // zo = ml - zl * zf
        zoomOffset = [
            mouseLocation[0] - zoomLocation[0] * zoomFactor,
            mouseLocation[1] - zoomLocation[1] * zoomFactor,
        ];
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (!focused) return;
        e = e || window.event;

        if (e.key === "ArrowUp" || e.key === "w") {
            zoomOffset[1] += 10;
        } else if (e.key == "ArrowDown" || e.key == "s") {
            zoomOffset[1] -= 10;
        } else if (e.key == "ArrowLeft" || e.key == "a") {
            zoomOffset[0] += 10;
        } else if (e.key == "ArrowRight" || e.key == "d") {
            zoomOffset[0] -= 10;
        }
    }

    function getRelativeLocation(xy: Vec2): Vec2 {
        let loc = subtract(xy, innerOffsets) as Vec2;

        return [loc[0] / innerDimensions[0], loc[1] / innerDimensions[1]];
    }

    function displayLocation(xy: Vec2, innerOffsets: Vec2, zoomOffset: Vec2, zoomFactor: number, relative = false): Vec2 {
        let loc = xy;
        if (relative)
            loc = add(innerOffsets, [
                xy[0] * innerDimensions[0],
                xy[1] * innerDimensions[1],
            ]);

        return add(multiply(loc, zoomFactor), zoomOffset) as Vec2;
    }
</script>

<svelte:window on:keydown={handleKeyDown} />
<div class="w-full h-full">
    <svg
        id="svg"
        class="w-full h-full outline-none"
        on:mousewheel={handleMouseWheel}
        on:mousemove={handleMouseMove}
        on:touchmove={handleMouseMove}
        on:mouseup={handleMouseUp}
        on:touchend={handleMouseUp}
        on:dblclick={handleDoubleClick}
        on:focusin={() => (focused = true)}
        on:focusout={() => (focused = false)}
    >
        {#if Object.entries(dataPoints).length > 0}
            {#each Object.entries(dataPoints) as [id, dp] (id)}
                {#if dp.connected}
                    <Line
                        p1={displayLocation(dp.xy, innerOffsets, zoomOffset, zoomFactor, true)}
                        p2={displayLocation(markerLocation, innerOffsets, zoomOffset, zoomFactor, true)}
                    />
                {/if}
                <Point
                    xy={displayLocation(dp.xy, innerOffsets, zoomOffset, zoomFactor, true)}
                    radius={pointRadius}
                    color="rgba(136,157,191, 1)"
                />
                <PromptText
                    xy={[
                        (dp.xy[0] * innerDimensions[0] + innerOffsets[0]) *
                            zoomFactor +
                            zoomOffset[0] -
                            getTextBoxDimensions(
                                textWidth,
                                getDisplayText(dp.text).length,
                                fontSize
                            )[0] /
                                2,
                        (dp.xy[1] * innerDimensions[1] + innerOffsets[1]) *
                            zoomFactor +
                            zoomOffset[1] +
                            pointRadius,
                    ]}
                    color={`rgba(255,255,255,${dp.opacity}`}
                    wh={getTextBoxDimensions(
                        textWidth,
                        getDisplayText(dp.text).length,
                        fontSize
                    )}
                    {fontSize}
                    text={getDisplayText(dp.text)}
                />
            {/each}
            <Point
                xy={displayLocation(markerLocation, innerOffsets, zoomOffset, zoomFactor, true)}
                radius={markerRadius}
                color="rgba(136,157,191, 1)"
                handleMouseDown={() => (activePoint = true)}
            />
        {/if}
    </svg>
</div>

<style>
    :global(svg) {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
