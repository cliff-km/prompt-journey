<script lang="ts">
    type ActivePoint = string | number | null;
    import { add } from "mathjs";
    import Circle from "../svg/Circle.svelte";
    import Point from "../svg/Point.svelte";
    import Ring from "../svg/Ring.svelte";
    import PromptText from "../svg/PromptText.svelte";
    import {
        activePromptStore,
        activePrompt,
    } from "../stores/activePromptStore.js";
    import {
        pointToPolar,
        polarToPoint,
        closestPointOnCircle,
        pointOnBoundary,
        boundedAngle,
    } from "../lib/circle";
    import { getWeightOpacity } from "../lib/weights";
    import { getTextBoxDimensions } from "../lib/text";
    import {
        findBoxCenter,
        getSVGInputLocation,
    } from "../lib/vector";
    import RingHandle from "../svg/RingHandle.svelte";
    import type { Vec2 } from "../types";

    // display state
    export let center = [450, 450] as Vec2;
    export let radius = 250;
    $: ringRadius = radius - 30;
    export let pointRadius = 10;
    export let textWidth = 150;
    export let fontSize = 13;

    // inner state
    let mouseLocation = [0, 0] as Vec2;
    let activePoint: ActivePoint = null;

    $: {
        if (
            Object.keys($activePrompt.ringAngles).length !==
            Object.keys($activePrompt.weightedPrompts).length
        ) {
            activePromptStore.update({
                ...$activePrompt,
                ringAngles: initializeAngles($activePrompt.weightedPrompts, {}),
            });
        }
    }

    $: pointData = computePointData(
        $activePrompt.weightedPrompts,
        center,
        radius,
        $activePrompt.ringWeightScaling,
        $activePrompt.ringExponentialScaling,
        $activePrompt.ringStartAngle,
        $activePrompt.ringAngles ||
            initializeAngles($activePrompt.weightedPrompts, {})
    );

    function handleMouseUp(e: Event) {
        activePoint = null;
    }

    function activatePoint(pointId: ActivePoint) {
        activePoint = pointId;
    }

    function getTextLocation(pxy, textDimensions) {
        let angle = pointToPolar(pxy, center, radius)[0] - 180;
        if (angle < 0) {
            angle += 360;
        }
        const offset = pointOnBoundary(findBoxCenter(textDimensions), angle);

        return add(pxy, offset);
    }

    function initializeAngles(weightedPrompts, angles) {
        if (!weightedPrompts) return null;
        return Object.entries(weightedPrompts).reduce(
            (acc, [id, point], idx) => {
                const angle =
                    acc[id] ||
                    idx * (360 / Object.keys(weightedPrompts).length) - 90;
                acc[id] = angle;
                return acc;
            },
            angles
        );
    }

    function updateMarkerFromMouseLocation(mouseLocation) {
        console.log(radius, ringRadius);
        const markerLocation = boundedAngle(
            pointToPolar(
                closestPointOnCircle(mouseLocation, center, ringRadius),
                center,
                ringRadius
            )[0]
        );
        pointData = computePointData(
            $activePrompt.weightedPrompts,
            center,
            radius,
            $activePrompt.ringWeightScaling,
            $activePrompt.ringExponentialScaling,
            markerLocation,
            $activePrompt.ringAngles
        );
    }

    function handleMouseMove(e: MouseEvent | TouchEvent) {
        mouseLocation = getSVGInputLocation(e);
        if (activePoint === "main") {
            updateMarkerFromMouseLocation(mouseLocation);
        } else if (activePoint) {
            const point = { ...$activePrompt.weightedPrompts[activePoint] };
            const c = closestPointOnCircle(mouseLocation, center, radius);
            const angle = pointToPolar(c, center, radius)[0];

            const ca = { ...$activePrompt.ringAngles };
            ca[point.id] = angle;

            const wp = { ...$activePrompt.weightedPrompts };
            wp[activePoint] = point;

            pointData = computePointData(
                wp,
                center,
                radius,
                $activePrompt.ringWeightScaling,
                $activePrompt.ringExponentialScaling,
                $activePrompt.ringStartAngle,
                ca
            );
        }
    }

    function handleDoubleClick(e: Event) {
        mouseLocation = getSVGInputLocation(e);
        updateMarkerFromMouseLocation(mouseLocation);
    }

    function computePointData(
        weightedPrompts,
        center,
        radius,
        ringWeightScaling,
        ringExponentialScaling,
        ringStartAngle,
        ringAngles
    ) {
        if (!weightedPrompts || !center || !radius || !ringWeightScaling) {
            return null;
        }

        // set points
        let pd = Object.entries(weightedPrompts).reduce((acc, [id, point]) => {
            const reverse = $activePrompt.ringReverse;
            const unboundedDiff = reverse
                ? ringStartAngle - ringAngles[id]
                : ringAngles[id] - ringStartAngle;
            const angleDifference = boundedAngle(unboundedDiff);
            const unitWeight = Math.pow(
                1 - angleDifference / 360,
                ringExponentialScaling ? ringWeightScaling : 1
            );
            acc[id] = {
                angleDifference,
                xy: polarToPoint(center, [ringAngles[id], 1], radius),
                unitWeight,
            };
            return acc;
        }, {});

        // get weights by id

        const wp = { ...weightedPrompts };
        Object.entries(pd).forEach(([id, data]) => {
            wp[id].ringWeight = data.unitWeight;
        });

        activePromptStore.update({
            ...$activePrompt,
            ringStartAngle,
            weightedPrompts: wp,
            ringAngles,
        });

        return pd;
    }
</script>

<svg
    id="svg"
    class="w-full h-full"
    on:mousemove={handleMouseMove}
    on:touchmove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:touchend={handleMouseUp}
    on:dblclick={handleDoubleClick}
>
    {#if pointData && $activePrompt.weightedPrompts}
        <Circle xy={center} {radius} />

        {#each Object.entries($activePrompt.weightedPrompts) as [id, point]}
            <PromptText
                xy={getTextLocation(
                    pointData[id].xy,
                    getTextBoxDimensions(textWidth, point.text.length, fontSize)
                )}
                color={`rgba(255,255,255,${getWeightOpacity(
                    pointData[id].unitWeight
                )}`}
                wh={getTextBoxDimensions(
                    textWidth,
                    point.text.length,
                    fontSize
                )}
                {fontSize}
                text={point.text}
            />
            <Point
                xy={pointData[id].xy}
                radius={pointRadius}
                color={"rgba(76,97,141, 1)"}
                handleMouseDown={() => activatePoint(id)}
            />
        {/each}

        {#if Object.entries($activePrompt.weightedPrompts).length > 0}
            <Ring
                xy={center}
                radius={ringRadius}
                stroke={30}
            />
            <RingHandle
                reverse={$activePrompt.ringReverse}
                xy={center}
                radius={ringRadius}
                stroke={30}
                angle={$activePrompt.ringStartAngle}
                color="rgba(136,157,191, 1)"
                handleMouseDown={() => activatePoint("main")}
            />
        {/if}
    {/if}
</svg>

<style>
    :global(svg) {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
