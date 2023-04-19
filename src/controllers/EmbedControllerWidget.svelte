<script lang="ts">
    import type { Embeddings, PointData, Vec2 } from "../types";
    import EmbedExplorer from "../embeds/EmbedExplorer.svelte";
    import EmbedExplorerSettings from "../embeds/EmbedExplorerSettings.svelte";
    import { activePrompt } from "../stores/activePrompt.js";
    import { findBoxCenter } from "../lib/vector";
    import { getWeightOpacity } from "../lib/weights";
    import { getDistance } from "../lib/vector";
    import { activeEmbeddings } from "../stores/activeEmbeddings.js";
    import { avgPoint } from "../lib/vector";
    import {
        getHighestClusterAvailable,
        getClusterAnchors,
        pairPoints,
        get2DEmbeddings
    } from "../lib/embedMap";

    let controllerW = 0;
    let controllerH = 0;
    let dataPoints: Record<number, PointData> = {};
    $: dimensions = [controllerW || 250, controllerH || 250] as Vec2;
    $: center = findBoxCenter(dimensions);
    $: promptCount = Object.keys($activePrompt.weightedPrompts || {}).length;
    $: markerLocation = $activePrompt.embedMarker || ([0.5, 0.5] as Vec2);
    $: promptLimit =
        $activePrompt.embedPromptLimit ||
        Object.keys($activePrompt.weightedPrompts).length;
    $: expScaling = $activePrompt.embedExponentialScaling;
    $: weightScaling = $activePrompt.embedWeightScaling;

    $: {
        $activeEmbeddings &&
            Object.keys($activeEmbeddings).length <
                $activePrompt.embedClusters &&
            updateClusterCount(
                getHighestClusterAvailable(
                    Object.keys($activeEmbeddings).length
                )
            );
    }

    $: {
        recomputeFromScaling(expScaling, weightScaling);
    }

    $: {
        recomputeFromEmbeddings(
            $activeEmbeddings,
            $activePrompt.scaledEmbedMappings
        );
    }

    $: {
        recomputeFromPromptLimit(promptLimit);
    }

    function recomputeFromPromptLimit(promptLimit: number) {
        if ($activeEmbeddings && $activePrompt.scaledEmbedMappings) {
            updateDataPoints();
            recomputeWeights(
                markerLocation,
                expScaling,
                weightScaling,
                promptLimit
            );
        }
    }

    function recomputeFromEmbeddings(
        embeddings: Embeddings,
        scaledEmbedMappings: Record<number, Vec2> | undefined
    ) {
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
                    embedWeight,
                };
                dataPoints[parseInt(id)].opacity =
                    getWeightOpacity(embedWeight);
                dataPoints[parseInt(id)].connected = active;
            });

        activePrompt.update({
            ...$activePrompt,
            embedMarker: markerLocation,
            weightedPrompts,
        });
    }

    function updateDataPoints() {
        if (!$activeEmbeddings || !$activePrompt.scaledEmbedMappings) return;
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
                opacity: 1,
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

    function updateEmbedPromptLimit(value: number) {
        if (value > 0 && value <= promptCount)
            activePrompt.update({
                ...$activePrompt,
                embedPromptLimit: value,
            });
    }

    function updateExponentialScaling() {
        activePrompt.update({
            ...$activePrompt,
            embedExponentialScaling: !$activePrompt.embedExponentialScaling,
        });
    }

    function updateWeightScaling(value: number) {
        activePrompt.update({
            ...$activePrompt,
            embedWeightScaling: value,
        });
    }

    function updateClusterCount(count: number) {
        if ([0, 2, 4, 6, 8].indexOf(count) === -1) return;

        activePrompt.update({
            ...$activePrompt,
            embedClusters: count,
        });
    }

    async function shuffleEmbeddinMap() {
        activePrompt.update({
            ...$activePrompt,
            scaledEmbedMappings: get2DEmbeddings($activeEmbeddings),
        });
    }
</script>

<div
    class="w-full h-full"
    bind:clientWidth={controllerW}
    bind:clientHeight={controllerH}
>
    <EmbedExplorer {center} {dimensions} {onMarkerMove} {dataPoints} />
</div>

<EmbedExplorerSettings
    useExponentialScaling={$activePrompt.embedExponentialScaling}
    toggleExponentialScaling={updateExponentialScaling}
    exponentialScaling={$activePrompt.embedWeightScaling}
    setExponentialScaling={updateWeightScaling}
    connectionLimit={$activePrompt.embedPromptLimit || promptCount}
    setConnectionLimit={updateEmbedPromptLimit}
    maxConnectionLimit={promptCount}
    clusterCount={$activePrompt.embedClusters || 0}
    setClusterCount={updateClusterCount}
    maxClusterCount={promptCount}
    onShuffle={shuffleEmbeddinMap}
/>
<slot></slot>
