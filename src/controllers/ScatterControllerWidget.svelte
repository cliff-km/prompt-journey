<script lang="ts">
    import { WeightMode, type Embeddings, type PointData, type Vec2 } from "../types";
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
        get2DEmbeddings,
    } from "../lib/embedMap";
    import { onMount } from "svelte";

    let controllerW = 0;
    let controllerH = 0;
    let dataPoints: Record<number, PointData> = {};
    $: dimensions = [controllerW || 250, controllerH || 250] as Vec2;
    $: center = findBoxCenter(dimensions);
    $: promptCount = Object.keys($activePrompt.weightedPrompts || {}).length;
    $: markerLocation = $activePrompt.embedMarker || ([0.5, 0.5] as Vec2);
    $: promptLimit =
        $activePrompt.promptLimit ||
        Object.keys($activePrompt.weightedPrompts).length;
    $: expScaling = $activePrompt.embedExponentialScaling;
    $: weightScaling = $activePrompt.embedWeightScaling;
    $: weightMode = $activePrompt.weightMode;

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
        recomputeFromWeightMode(weightMode);
    }

    $: {
        recomputeFromScaling(expScaling, weightScaling);
    }

    $: {
        recomputeFromPromptLimit(promptLimit);
    }

    function recomputeFromWeightMode(weightMode: string) {
        updateDataPoints();
        recomputeWeights(
            markerLocation,
            expScaling,
            weightScaling,
            promptLimit
        );
    }

    function recomputeFromPromptLimit(promptLimit: number) {
        recomputeWeights(
            markerLocation,
            expScaling,
            weightScaling,
            promptLimit
        );
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

        const distances = Object.entries(dataPoints).reduce(
            (acc, [id, point]) => {
                const distance = getDistance(pivot, point.xy);
                acc[parseInt(id)] = distance;
                return acc;
            },
            {} as Record<number, number>
        );

        //get closest n points
        Object.entries(distances)
            .sort((a, b) => a[1] - b[1])
            .forEach(([id, dist], idx) => {
                if (!weightedPrompts[parseInt(id)]) return;
                const active = idx < promptLimit + 1;
                if (active && dist > maxDistance) maxDistance = dist * 1.1;
            });

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
            embedMarker: [...markerLocation],
            weightedPrompts,
        });
    }

    function updateDataPoints() {
        const ids = Object.keys($activePrompt.weightedPrompts);

        const size = Math.ceil(Math.sqrt(ids.length));
        
        let newDataPoints;
        if(weightMode === WeightMode.EmbedGrid) {
            newDataPoints = ids
                .sort(() => 0.5 - Math.random())
                .reduce((acc, id, idx) => {
                    acc[id] = {
                        xy: [
                            (1 / size) * (idx % size) + (1 / size),
                            (1 / size) * Math.floor(idx / size) +
                                (1 / size),
                        ] as Vec2,
                        text: $activePrompt.weightedPrompts[parseInt(id)].text,
                        connected: true,
                        opacity: 1,
                    };
                    return acc;
                }, {} as Record<string, PointData>);
        } else {
            newDataPoints = ids
                .sort(() => 0.5 - Math.random())
                .reduce((acc, id, idx) => {
                    acc[id] = {
                        xy: [
                            (1 / size) * (idx % size) + (1 / size) * Math.random(),
                            (1 / size) * Math.floor(idx / size) +
                                (1 / size) * Math.random(),
                        ] as Vec2,
                        text: $activePrompt.weightedPrompts[parseInt(id)].text,
                        connected: true,
                        opacity: 1,
                    };
                    return acc;
                }, {} as Record<string, PointData>);
        }

        dataPoints = newDataPoints;
        return dataPoints;
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
                promptLimit: value,
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

    async function shuffleEmbeddingMap() {
        updateDataPoints();
        recomputeWeights(
            markerLocation,
            expScaling,
            weightScaling,
            promptLimit
        );
    }

    onMount(() => {
        updateDataPoints();
        recomputeWeights(
            markerLocation,
            expScaling,
            weightScaling,
            promptLimit
        );
    });
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
    connectionLimit={$activePrompt.promptLimit || promptCount}
    setConnectionLimit={updateEmbedPromptLimit}
    maxConnectionLimit={promptCount}
    maxClusterCount={0}
    onShuffle={shuffleEmbeddingMap}
/>
<slot />
