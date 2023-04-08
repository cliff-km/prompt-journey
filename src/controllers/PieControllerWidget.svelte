<script lang="ts">
    type ActivePoint = string | number | null;
    import { add } from "mathjs";
    import Circle from "../svg/Circle.svelte";
    import Point from "../svg/Point.svelte";
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
    } from "../lib/circle";
    import { getWeightOpacity } from "../lib/weights";
    import { getTextBoxDimensions } from "../lib/text";
    import {
        findBoxCenter,
        getSVGMouseLocation,
    } from "../lib/vector";
    import SolidLine from "../svg/SolidLine.svelte";

    // display state
    export let center = [450, 450];
    export let radius = 250;
    export let pointRadius = 10;
    export let textWidth = 150;
    export let fontSize = 13;

    // inner state
    let mouseLocation = [0, 0];
    let mouseStartAngle = null;
    let segmentAngleOffsets = {};
    let mouseAngleChange = 0;
    let activePoint: ActivePoint = null;
    let activeSegment: null;

    $: {
        if (
            Object.keys($activePrompt.pieAngles || {}).length !==
            Object.keys($activePrompt.weightedPrompts).length
        ) {
            activePromptStore.update({
                ...$activePrompt,
                pieAngles: initializeAngles($activePrompt.weightedPrompts, {}),
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
        activeSegment = null;
        mouseAngleChange = 0;
        mouseStartAngle = null;
        segmentAngleOffsets = {};
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

    function handleSegmentDragStart(e, id){
        activeSegment = id;
    }

    function areCircularlyOrdered(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }

        const len = arr1.length;
        let offset = -1;

        for (let i = 0; i < len; i++) {
            if (arr2[i] === arr1[0]) {
            offset = i;
            break;
            }
        }

        if (offset === -1) {
            return false;
        }

        for (let i = 0; i < len; i++) {
            if (arr1[i] !== arr2[(i + offset) % len]) {
            return false;
            }
        }

        return true;
    }

    function handleSegmentDrag(mouseLocation) {
        const id = activeSegment;
        const ca = { ...$activePrompt.pieAngles };

        // getIds in angle order
        const ids = Object.entries(ca)
            .sort((a, b) => positiveAngle(a[1]) - positiveAngle(b[1]))
            .map((p) => p[0]);

        // get next id
        const idx = ids.indexOf(id);
        const nextIdx = idx + 1 === ids.length ? 0 : idx + 1;
        const nextId = ids[nextIdx];

        // set segment angle offset if not set
        if (!segmentAngleOffsets[id]) {
            segmentAngleOffsets[id] = ca[id];
        }
        if (!segmentAngleOffsets[nextId]) {
            segmentAngleOffsets[nextId] = ca[nextId];
        }
        
        // get mouse angle change
        const mouseAngle = pointToPolar(mouseLocation, center, radius)[0];
        const angleChange = mouseAngle - mouseStartAngle;

        const nextCa = { ...ca };
        nextCa[id] = positiveAngle(angleChange + segmentAngleOffsets[id]);
        nextCa[nextId] = positiveAngle(angleChange + segmentAngleOffsets[nextId]);


        // determine if order will change
        const nextIds = Object.entries(nextCa)
            .sort((a, b) => positiveAngle(a[1]) - positiveAngle(b[1]))
            .map((p) => p[0]);

        // if order will change, don't update
        const areSameOrder = areCircularlyOrdered(ids, nextIds);
        if(!areSameOrder) return;

        pointData = computePointData(
            $activePrompt.weightedPrompts,
            center,
            radius,
            nextCa
        );
    }

    function handlePointDrag(mouseLocation) {
        const point = { ...$activePrompt.weightedPrompts[activePoint] };
        const c = closestPointOnCircle(mouseLocation, center, radius);
        const angle = positiveAngle(pointToPolar(c, center, radius)[0]);

        const ca = { ...$activePrompt.pieAngles };
        ca[point.id] = angle;

        const wp = { ...$activePrompt.weightedPrompts };
        wp[activePoint] = point;

        pointData = computePointData(wp, center, radius, ca);
    }

    function handleMouseMove(e) {
        e.preventDefault();
        mouseLocation = getSVGMouseLocation(e);
        if (activePoint) {
            handlePointDrag(mouseLocation)
        } else if(activeSegment) {
            handleSegmentDrag(mouseLocation)
        } else {
            mouseStartAngle = pointToPolar(mouseLocation, center, radius)[0];
        }
    }

    function positiveAngle(angle) {
        if (angle < 0) {
            return 360 + -1 * (Math.abs(angle) % 360);
        }
        if (angle > 360) {
            return (angle % 360);
        }
        return angle;
    }

    function handleMouseWheel(e, id) {
        e.preventDefault();
        const ca = { ...$activePrompt.pieAngles };

        // getIds in angle order
        const ids = Object.entries(ca)
            .sort((a, b) => positiveAngle(a[1]) - positiveAngle(b[1]))
            .map((p) => p[0]);

        // get next id
        const idx = ids.indexOf(id);
        const nextIdx = idx + 1 === ids.length ? 0 : idx + 1;
        const nextId = ids[nextIdx];
        
        ca[id] = positiveAngle(ca[id] - e.deltaY / 100);
        ca[nextId] = positiveAngle(ca[nextId] + e.deltaY / 100);
        pointData = computePointData(
            $activePrompt.weightedPrompts,
            center,
            radius,
            ca
        );
    }

    function computePointData(weightedPrompts, center, radius, pieAngles) {
        if (!weightedPrompts || !center || !radius) {
            return null;
        }

        // sort prompts by angle
        const sortedPrompts = Object.entries(weightedPrompts).sort(
            (a, b) => positiveAngle(pieAngles[a[0]]) - positiveAngle(pieAngles[b[0]])
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
            const textXY = polarToPoint(
                center,
                [angle + 0.5 * angleDiff, 1],
                radius
            );
            const unitWeight = angleDiff / maxAngleDiff;
            acc[id] = { xy, textXY, angle, angleDiff, unitWeight };
            return acc;
        }, {});

        const wp = { ...weightedPrompts };

        // update weighted prompts
        Object.entries(pointData).forEach(([id, point]) => {
            wp[id].pieWeight = point.unitWeight;
        });

        activePromptStore.update({
            ...$activePrompt,
            weightedPrompts: wp,
            pieAngles,
        });

        return pointData;
    }

    function createPieSegment(cxy, radius, startAngle, endAngle) {
        const startX = cxy[0] + radius * Math.cos((startAngle * Math.PI) / 180);
        const startY = cxy[1] + radius * Math.sin((startAngle * Math.PI) / 180);
        const endX = cxy[0] + radius * Math.cos((endAngle * Math.PI) / 180);
        const endY = cxy[1] + radius * Math.sin((endAngle * Math.PI) / 180);
        const largeArc = endAngle - startAngle <= 180 ? "0" : "1";

        return `M${cxy[0]},${cxy[1]} L${startX},${startY} A${radius},${radius} 0 ${largeArc} 1 ${endX},${endY} Z`;
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
            <SolidLine p1={center} p2={pointData[id].xy} />
            <path
                on:mousewheel={(e)=>handleMouseWheel(e, id)}
                on:mousedown={(e)=>handleSegmentDragStart(e, id)}
                d={createPieSegment(
                    center,
                    radius,
                    pointData[id].angle,
                    pointData[id].angle + pointData[id].angleDiff
                )}
                fill={`rgba(26,47,91,${
                    getWeightOpacity(pointData[id].unitWeight) / 4
                }`}
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
