<script lang="ts">
    import type { Embeddings, PointData, Vec2 } from "../types";
    import EmbedExplorer from "../embeds/EmbedExplorer.svelte";
    import {
        activePrompt,
    } from "../stores/activePrompt.js";
    import { getWeightOpacity } from "../lib/weights";
    import { getDistance } from "../lib/vector";
    import { add, multiply } from "mathjs";
    import Munkres from "munkres-js";

    export let center = [100, 100] as Vec2;
    export let dimensions = [100, 100] as Vec2;

    let dataPoints: Record<number, PointData> = {};

    $: markerLocation = $activePrompt.embedMarker || [0.5, 0.5];
    $: promptLimit = $activePrompt.embedPromptLimit || Object.keys($activePrompt.weightedPrompts).length;
    $: expScaling = $activePrompt.embedExponentialScaling;
    $: weightScaling = $activePrompt.embedWeightScaling;

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
        recomputeFromPromptLimit(promptLimit);
    }

    function getClusterAnchors(k: number) : Vec2[] {
        switch (k) {
            case 2:
                return [
                    multiply(add([0, 0], [0, 1]), 0.5) as Vec2,
                    multiply(add([1, 0], [1, 1]), 0.5) as Vec2,
                ];
            case 4:
                return [
                    [0, 0],
                    [0, 1],
                    [1, 1],
                    [1, 0],
                ];
            case 6:
                return [
                    multiply(add([0, 0], [0, 1]), 0.5) as Vec2,
                    multiply(add([1, 0], [1, 1]), 0.5) as Vec2,
                    [0, 0],
                    [0, 1],
                    [1, 1],
                    [1, 0],
                ];
            case 8:
                return [
                    multiply(add([0, 0], [0, 1]), 0.5) as Vec2,
                    multiply(add([1, 0], [1, 1]), 0.5) as Vec2,
                    [0, 0],
                    [0, 1],
                    [1, 1],
                    [1, 0],
                    multiply(add([0, 0], [1, 0]), 0.5) as Vec2,
                    multiply(add([0, 1], [1, 1]), 0.5) as Vec2,
                ];
            default:
                return [];
        }
    }

    function createDistanceMatrix(setA: Vec2[], setB: Vec2[]) {
        return setA.map((pointA) =>
            setB.map((pointB) => getDistance(pointA, pointB))
        );
    }

    function pairPoints(setA: Vec2[], setB: Vec2[]) {
        if (setA.length !== setB.length) {
            throw new Error("Both sets should have the same number of points");
        }

        const distanceMatrix = createDistanceMatrix(setA, setB);

        const indexes: Vec2[] = Munkres(distanceMatrix);

        if (!indexes) {
            return null;
        }

        return indexes.map(([indexA, indexB]) => ({
            ids: [indexA, indexB],
            points: [setA[indexA], setB[indexB]],
        }));
    }

    function avgPoint(points: Vec2[]) : Vec2 {
        const sum = points.reduce((acc, point) => add(acc, point), [0, 0]);
        return multiply(sum, 1 / points.length) as Vec2;
    }

    function recomputeFromPromptLimit(promptLimit: number) {
        if ($activePrompt.embeddings && $activePrompt.scaledEmbedMappings) {
            updateDataPoints();
            recomputeWeights(
                markerLocation,
                expScaling,
                weightScaling,
                promptLimit
            );
        }
    }

    function recomputeFromEmbeddings(embeddings: Embeddings, scaledEmbedMappings: Record<number, Vec2> | undefined) {
        if (embeddings && scaledEmbedMappings) {
            updateDataPoints();
            recomputeWeights(
                markerLocation,
                expScaling,
                weightScaling,
                promptLimit
            );
        }
    }

    function recomputeFromScaling(expScaling: boolean, weightScaling: number) {
        recomputeWeights(
            markerLocation,
            expScaling,
            weightScaling,
            promptLimit
        );
    }

    function recomputeWeights(
        pivot: Vec2,
        expScaling: boolean,
        weightScaling: number,
        promptLimit: number
    ) {
        if (!dataPoints) return;

        let weightedPrompts = { ...$activePrompt.weightedPrompts };

        let maxDistance = 0;

        // find furthest distance between datapoints
        Object.values(dataPoints).forEach((pointA) => {
            Object.values(dataPoints).forEach((pointB) => {
                const dist = getDistance(pointA.xy, pointB.xy);
                if (dist > maxDistance) maxDistance = dist;
            });
        });

        const distances = Object.entries(dataPoints).reduce(
            (acc, [id, point]) => {
                const distance = getDistance(pivot, point.xy);
                acc[parseInt(id)] = distance;
                return acc;
            },
            {} as Record<number, number>
        );

        const useExpScaling = (active: boolean, dist: number) => {
            const value = active
                ? Math.round(
                      Math.pow(1 - dist / maxDistance, weightScaling) * 100
                  ) / 100
                : 0;
            if (value < 0) return 0;
            return value;
        };

        const useStdScaling = (active: boolean, dist: number) => {
            const value = active
                ? Math.round((1 - dist / maxDistance) * 100) / 100
                : 0;
            if (value < 0) return 0;
            return value;
        };

        // normalize distances
        Object.entries(distances)
            .sort((a, b) => a[1] - b[1])
            .forEach(([id, dist], idx) => {
                if (!weightedPrompts[parseInt(id)]) return;
                const active = idx < promptLimit;
                const embedWeight = expScaling
                    ? useExpScaling(active, dist)
                    : useStdScaling(active, dist);
                weightedPrompts[parseInt(id)] = {
                    ...weightedPrompts[parseInt(id)],
                    embedWeight
                };
                dataPoints[parseInt(id)].opacity = getWeightOpacity(embedWeight);
                dataPoints[parseInt(id)].connected = active;
            });

            activePrompt.update({
            ...$activePrompt,
            embedMarker: markerLocation,
            weightedPrompts,
        });
    }

    function updateDataPoints() {
        if(!$activePrompt.embeddings || !$activePrompt.scaledEmbedMappings) return;
        const ids = Object.keys($activePrompt.scaledEmbedMappings);

        const findAverageClusterPoint = (cluster: number[]) => {
            if (!cluster.length) return center;
            const points = cluster.map((i) => newDataPoints[i].xy);
            return avgPoint(points);
        };

        const newDataPoints = ids.reduce((acc, id, idx) => {
            acc[id] = {
                xy: $activePrompt.scaledEmbedMappings[idx],
                text: $activePrompt.weightedPrompts[idx].text,
                connected: true,
                opacity: 1
            };
            return acc;
        }, {} as Record<string, PointData>);


        if ($activePrompt.embedClusters && $activePrompt.embedClusterSets) {
            const k = $activePrompt.embedClusters;
            const clusters = $activePrompt.embedClusterSets[k];
            let setA = clusters.map((c) => findAverageClusterPoint(c));
            const setB = getClusterAnchors(k);

            const pairs = pairPoints(setA, setB);

            if (pairs) {
                pairs.forEach((p) => {
                    const clusterId = p.ids[0];
                    const anchor = p.points[1];

                    clusters[clusterId].forEach((id) => {
                        newDataPoints[id].xy = avgPoint([
                            newDataPoints[id].xy,
                            anchor,
                        ]);
                    });
                });
            }
        }

        dataPoints = newDataPoints;
    }

    function onMarkerMove(pos: Vec2) {
        markerLocation = pos;
        recomputeWeights(
            markerLocation,
            expScaling,
            weightScaling,
            promptLimit
        );
    }
</script>

<EmbedExplorer 
    {center}
    {dimensions}
    {onMarkerMove}
    {dataPoints}
/>
