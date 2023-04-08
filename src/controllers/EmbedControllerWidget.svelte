<script lang="ts">
    import Point from "../svg/Point.svelte";
    import Line from "../svg/DashedLine.svelte";
    import PromptText from "../svg/PromptText.svelte";
    import {
        activePromptStore,
        activePrompt,
    } from "../stores/activePromptStore.js";
    import { getWeightOpacity } from "../lib/weights";
    import { getTextBoxDimensions } from "../lib/text";
    import { getDistance, getSVGMouseLocation } from "../lib/vector";
    import { add, multiply } from "mathjs";
    import * as Munkres from "munkres-js";

    // display state
    export let center = [100, 100];
    export let dimensions = [100, 100];
    export let pointRadius = 4;
    export let markerRadius = 10;
    export let textWidth = 150;
    export let fontSize = 12;
    export let innerPad = 100;

    // inner state
    let activePoint: boolean = false;
    let dataPoints = null;
    let innerDimensions = dimensions;
    let innerOffsets = [0, 0];

    $: markerLocation = $activePrompt.embedMarker || center;

    $: expScaling = $activePrompt.embedExponentialScaling;
    $: weightScaling = $activePrompt.embedWeightScaling;
    $: promptLimit =
        $activePrompt.embedPromptLimit ||
        Object.keys($activePrompt.weightedPrompts).length;

    $: {
        recomputeFromScaling(expScaling, weightScaling);
    }

    $: {
        recomputeFromEmbeddings(
            $activePrompt.embeddings,
            $activePrompt.scaledEmbedMappings
        );
    }

    $: {
        recomputeFromDimensions(innerDimensions);
    }

    $: {
        recomputeFromPromptLimit(promptLimit);
    }

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

    function getInnerCorners() {
        return {
            "00": [innerOffsets[0], innerOffsets[1]],
            "01": [innerOffsets[0], innerOffsets[1] + innerDimensions[1]],
            "11": [
                innerOffsets[0] + innerDimensions[0],
                innerOffsets[1] + innerDimensions[1],
            ],
            "10": [innerOffsets[0] + innerDimensions[0], innerOffsets[1]],
        };
    }

    function createDistanceMatrix(setA, setB) {
        return setA.map((pointA) =>
            setB.map((pointB) => getDistance(pointA, pointB))
        );
    }

    function pairPoints(setA, setB) {
        if (setA.length !== setB.length) {
            throw new Error("Both sets should have the same number of points");
        }

        const distanceMatrix = createDistanceMatrix(setA, setB);
        console.log(distanceMatrix);
        const indexes = Munkres(distanceMatrix);

        return indexes.map(([indexA, indexB]) => ({
            ids: [indexA, indexB],
            points: [setA[indexA], setB[indexB]],
        }));
    }

    function avgPoint(points) {
        const sum = points.reduce((acc, point) => add(acc, point), [0, 0]);
        return multiply(sum, 1 / points.length);
    }

    function getClusterAnchors(k) {
        const corners = getInnerCorners();
        switch (k) {
            case 2:
                return [
                    multiply(add(corners["00"], corners["01"]), 0.5),
                    multiply(add(corners["10"], corners["11"]), 0.5),
                ];
            case 4:
                return [
                    corners["00"],
                    corners["01"],
                    corners["11"],
                    corners["10"],
                ];
            case 6:
                return [
                    multiply(add(corners["00"], corners["01"]), 0.5),
                    multiply(add(corners["10"], corners["11"]), 0.5),
                    corners["00"],
                    corners["01"],
                    corners["11"],
                    corners["10"],
                ];
            case 8:
                return [
                    multiply(add(corners["00"], corners["01"]), 0.5),
                    multiply(add(corners["10"], corners["11"]), 0.5),
                    corners["00"],
                    corners["01"],
                    corners["11"],
                    corners["10"],
                    multiply(add(corners["00"], corners["10"]), 0.5),
                    multiply(add(corners["01"], corners["11"]), 0.5),
                ];
            default:
                return null;
        }
    }

    function recomputeFromPromptLimit(promptLimit) {
        if ($activePrompt.embeddings && $activePrompt.scaledEmbedMappings) {
            updateDataPoints();
            recomputeWeights(
                markerLocation,
                expScaling,
                weightScaling,
                innerDimensions,
                promptLimit
            );
        }
    }

    function recomputeFromEmbeddings(embeddings, scaledEmbedMappings) {
        if (embeddings && scaledEmbedMappings) {
            updateDataPoints();
            recomputeWeights(
                markerLocation,
                expScaling,
                weightScaling,
                innerDimensions,
                promptLimit
            );
        }
    }

    function recomputeFromScaling(expScaling, weightScaling) {
        recomputeWeights(
            markerLocation,
            expScaling,
            weightScaling,
            innerDimensions,
            promptLimit
        );
    }

    function recomputeFromDimensions(innerDimensions) {
        if ($activePrompt.embeddings && $activePrompt.scaledEmbedMappings) {
            updateDataPoints();
            recomputeWeights(
                markerLocation,
                expScaling,
                weightScaling,
                innerDimensions,
                promptLimit
            );
        }
    }

    function recomputeWeights(
        pivot,
        expScaling,
        weightScaling,
        innerDimensions,
        promptLimit
    ) {
        if (!dataPoints) return;

        let weightedPrompts = { ...$activePrompt.weightedPrompts };

        let maxDistance = 0;

        // find furthest distance between datapoints
        Object.values(dataPoints).forEach((pointA) => {
            Object.values(dataPoints).forEach((pointB) => {
                const dist = getDistance(pointA.embedXY, pointB.embedXY);
                if (dist > maxDistance) maxDistance = dist;
            });
        });

        const distances = Object.entries(dataPoints).reduce(
            (acc, [id, point]) => {
                const distance = getDistance(pivot, point.embedXY);
                acc[id] = distance;
                return acc;
            },
            {}
        );

        const useExpScaling = (embedActive, dist) => {
            const value = embedActive
                ? Math.round(
                      Math.pow(1 - dist / maxDistance, weightScaling) * 100
                  ) / 100
                : 0;
            if (value < 0) return 0;
            return value;
        };

        const useStdScaling = (embedActive, dist) => {
            const value = embedActive
                ? Math.round((1 - dist / maxDistance) * 100) / 100
                : 0;
            if (value < 0) return 0;
            return value;
        };

        // normalize distances
        Object.entries(distances)
            .sort((a, b) => a[1] - b[1])
            .forEach(([id, dist], idx) => {
                if (!weightedPrompts[id]) return;
                const embedActive = idx < promptLimit;
                weightedPrompts[id] = {
                    ...weightedPrompts[id],
                    embedWeight: expScaling
                        ? useExpScaling(embedActive, dist)
                        : useStdScaling(embedActive, dist),
                    embedActive,
                };
            });

        activePromptStore.update({
            ...$activePrompt,
            embedMarker: markerLocation,
            weightedPrompts,
        });
    }

    function handleDoubleClick(e) {
        const mouseLocation = getSVGMouseLocation(e, svg);
        markerLocation = mouseLocation;
        recomputeWeights(
            markerLocation,
            expScaling,
            weightScaling,
            innerDimensions,
            promptLimit
        );
    }

    function handleMouseMove(e) {
        if (activePoint) {
            const mouseLocation = getSVGMouseLocation(e, svg);
            markerLocation = mouseLocation;
            recomputeWeights(
                markerLocation,
                expScaling,
                weightScaling,
                innerDimensions,
                promptLimit
            );
        }
    }

    function handleMouseUp(e) {
        activePoint = false;
    }


    function updateDataPoints() {
        const ids = Object.keys($activePrompt.scaledEmbedMappings);
        const newDataPoints = ids.reduce((acc, id, idx) => {
            acc[id] = {
                embedXY: [
                    innerOffsets[0] +
                        innerDimensions[0] *
                            $activePrompt.scaledEmbedMappings[idx][0],
                    innerOffsets[1] +
                        innerDimensions[1] *
                            $activePrompt.scaledEmbedMappings[idx][1],
                ],
            };
            return acc;
        }, {});

        const findAverageClusterPoint = (cluster) => {
            if(!cluster.length) return center;
            const points = cluster.map((i) => newDataPoints[i].embedXY);
            return avgPoint(points);
        };

        if($activePrompt.embedClusters) {
            const k = $activePrompt.embedClusters;
            const clusters = $activePrompt.embedClusterSets[k];
            let setA = clusters.map((c) => findAverageClusterPoint(c));
            const setB = getClusterAnchors(k);

            const pairs = pairPoints(setA, setB);

            pairs.forEach(p => {
                const clusterId = p.ids[0];
                const anchor = p.points[1];
                
                clusters[clusterId].forEach(id => {
                    newDataPoints[id].embedXY = avgPoint([newDataPoints[id].embedXY, anchor]);
                });
            });

            console.log("paired", pairs);
        }

        dataPoints = newDataPoints;
    }
</script>

<svg
    id="svg"
    class="w-full h-full"
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:dblclick={handleDoubleClick}
>
    {#if Object.entries($activePrompt.weightedPrompts).length > 0 && Object.entries(dataPoints || {}).length > 0}
        {#each Object.entries($activePrompt.weightedPrompts) as [id, wp] (id)}
            {#if wp.embedActive}
                <Line p1={dataPoints[id].embedXY} p2={markerLocation} />
            {/if}
            <Point
                xy={dataPoints[id].embedXY}
                radius={pointRadius}
                color="rgba(136,157,191, 1)"
            />
            <PromptText
                xy={[
                    dataPoints[id].embedXY[0] -
                        getTextBoxDimensions(
                            textWidth,
                            wp.text.length,
                            fontSize
                        )[0] /
                            2,
                    dataPoints[id].embedXY[1] + pointRadius,
                ]}
                color={`rgba(255,255,255,${getWeightOpacity(wp.embedWeight)}`}
                wh={getTextBoxDimensions(textWidth, wp.text.length, fontSize)}
                {fontSize}
                text={wp.text}
            />
        {/each}
        <Point
            xy={markerLocation}
            radius={markerRadius}
            color="rgba(136,157,191, 1)"
            handleMouseDown={() => (activePoint = true)}
        />
    {/if}
</svg>

<style>
    :global(svg) {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
