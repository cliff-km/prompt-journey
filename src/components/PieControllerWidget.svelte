<script lang="ts">
    type ActivePoint = string | number | null;
    import { add } from "mathjs";
    import Circle from "./Circle.svelte";
    import Point from "./Point.svelte";
    import PromptText from "./PromptText.svelte";
    import {
        activePromptStore,
        activePrompt,
    } from "../lib/activePromptStore.js";
    import {
        pointToPolar,
        polarToPoint,
        closestPointOnCircle,
        pointOnBoundary,
    } from "../lib/circle";
    import { getWeightOpacity } from "../lib/weights";
    import { getTextBoxDimensions } from "../lib/text";
    import {
        getDistance,
        findBoxCenter,
        getSVGMouseLocation,
    } from "../lib/vector";
    import SolidLine from "./SolidLine.svelte";

    // display state
    export let center = [450, 450];
    export let radius = 250;
    export let pointRadius = 10;
    export let textWidth = 150;
    export let fontSize = 13;

    // inner state
    let mouseLocation = [0, 0];
    let activePoint: ActivePoint = null;

    $: {
        if (
            Object.keys($activePrompt.pieAngles || {}).length !==
            Object.keys($activePrompt.weightedPrompts).length
        ) {
            activePromptStore.updateActivePrompt({
                ...$activePrompt,
                pieAngles: initializeAngles(
                    $activePrompt.weightedPrompts,
                    {}
                ),
            });
        }
    }

    $: pointData = computePointData(
        $activePrompt.weightedPrompts,
        center,
        radius,
        $activePrompt.pieAngles ||
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

    function handleMouseMove(e) {
        mouseLocation = getSVGMouseLocation(e);
        if (activePoint) {
            const point = { ...$activePrompt.weightedPrompts[activePoint] };
            const c = closestPointOnCircle(mouseLocation, center, radius);
            const angle = pointToPolar(c, center, radius)[0];

            const ca = { ...$activePrompt.pieAngles };
            ca[point.id] = angle;

            const wp = { ...$activePrompt.weightedPrompts };
            wp[activePoint] = point;

            pointData = computePointData(
                wp,
                center,
                radius,
                ca
            );
        }
    }

    function computePointData(
        weightedPrompts,
        center,
        radius,
        pieAngles
    ) {
        if (
            !weightedPrompts ||
            !center ||
            !radius
        ) {
            return null;
        }

        // sort prompts by angle
        const sortedPrompts = Object.entries(weightedPrompts).sort(
            (a, b) => pieAngles[a[0]] - pieAngles[b[0]]
        );

        // compute angle differences
        const angleDiffs = sortedPrompts.map((p, idx) => {
            const nextIdx = idx + 1 === sortedPrompts.length ? 0 : idx + 1;
            const angleDiff =
                pieAngles[sortedPrompts[nextIdx][0]] -
                pieAngles[sortedPrompts[idx][0]];
            if (angleDiff < 0) {
                return [p[0], 360 + angleDiff];
            }
            return [p[0], angleDiff];
        });

        // get max angle diff
        const maxAngleDiff = Math.max(...angleDiffs.map((p) => p[1]));

        // compute point locations
        const pointData = angleDiffs.reduce((acc, [id, angleDiff]) => {
            const p = { ...weightedPrompts[id] };
            const angle = pieAngles[id];
            const xy = polarToPoint(center, [angle, 1], radius);
            const textXY = polarToPoint(center, [angle + 0.5 * angleDiff, 1], radius);
            const unitWeight = angleDiff / maxAngleDiff;
            acc[id] = { xy, textXY, unitWeight };
            return acc;
        }, {});

        const wp = { ...weightedPrompts };

        // update weighted prompts
        Object.entries(pointData).forEach(([id, point]) => {
            wp[id].pieWeight = point.unitWeight;
        });

        activePromptStore.updateActivePrompt({
            ...$activePrompt,
            weightedPrompts: wp,
            pieAngles,
        });

        return pointData;
    }
</script>

<svg
    id="svg"
    class="w-full h-full"
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
>
    {#if pointData && $activePrompt.weightedPrompts}
        <Circle xy={center} {radius} />

        {#each Object.entries($activePrompt.weightedPrompts) as [id, point]}
            <SolidLine
                p1={center}
                p2={pointData[id].xy}
            />
            <Point
                xy={pointData[id].xy}
                radius={pointRadius}
                color={"rgba(76,97,141, 1)"}
                handleMouseDown={() => activatePoint(id)}
            />
            <PromptText
                xy={getTextLocation(
                    pointData[id].textXY,
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
        {/each}
    {/if}
</svg>

<style>
    :global(svg) {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
