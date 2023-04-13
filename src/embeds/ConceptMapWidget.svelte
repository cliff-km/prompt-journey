<script lang="ts">
    import type { EmbeddedConcepts, PointData, Vec2 } from "../types";
    import EmbedExplorer from "../embeds/EmbedExplorer.svelte";
    import EmbedExplorerSettings from "../embeds/EmbedExplorerSettings.svelte";
    import { embeddedConcepts } from "../stores/concepts";
    import { findBoxCenter } from "../lib/vector";
    import { getWeightOpacity } from "../lib/weights";
    import { getDistance } from "../lib/vector";
    import { avgPoint } from "../lib/vector";
    import {
        getHighestClusterAvailable,
        getClusterAnchors,
        pairPoints,
        get2DEmbeddings,
        getKMeansClusters,
    } from "../lib/embedMap";
    import { onMount } from "svelte";

    let controllerW = 0;
    let controllerH = 0;
    let dataPoints: Record<string, PointData> = {};
    let markerLocation = [0.5, 0.5] as Vec2;
    let conceptLimit = 10;
    let useExponentialScaling = false;
    let exponentialScaling = 2;
    let clusterCount = 0;
    let scaledEmbedMappings: Record<string, Vec2> | undefined = undefined;
    let weights = {} as Record<string, number>;
    let embedClusterSets = {} as Record<number, string[][]>;

    $: dimensions = [controllerW || 250, controllerH || 250] as Vec2;
    $: center = findBoxCenter(dimensions);

    $: conceptCount = Object.keys($embeddedConcepts).length;

    $: {
        $embeddedConcepts &&
            conceptCount < clusterCount &&
            updateClusterCount(getHighestClusterAvailable(conceptCount));
    }

    $: {
        recomputeFromScaling(useExponentialScaling, exponentialScaling);
    }

    $: {
        recomputeFromConcepts($embeddedConcepts, scaledEmbedMappings);
    }

    $: {
        recomputeFromConceptLimit(conceptLimit);
    }

    function recomputeFromConceptLimit(conceptLimit: number) {
        if ($embeddedConcepts && scaledEmbedMappings) {
            updateDataPoints();
            recomputeWeights(
                markerLocation,
                useExponentialScaling,
                exponentialScaling,
                conceptLimit
            );
        } else {
            console.log("no concepts or mappings")
        }
    }

    function recomputeFromConcepts(
        embeddedConcepts: EmbeddedConcepts,
        scaledEmbedMappings: Record<number, Vec2> | undefined
    ) {
        if (embeddedConcepts && scaledEmbedMappings) {
            updateDataPoints();
            recomputeWeights(
                markerLocation,
                useExponentialScaling,
                exponentialScaling,
                conceptLimit
            );
        } else {
            console.log("no concepts or mappings")
        }
    }

    function recomputeFromScaling(
        useExponentialScaling: boolean,
        exponentialScaling: number
    ) {
        recomputeWeights(
            markerLocation,
            useExponentialScaling,
            exponentialScaling,
            conceptLimit
        );
    }

    function recomputeWeights(
        pivot: Vec2,
        useExponentialScaling: boolean,
        exponentialScaling: number,
        conceptLimit: number
    ) {
        console.log("recomputing weights")
        if (!dataPoints) return;

        let maxDistance = 0;

        const newWeights = { ...weights };

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
                acc[id] = distance;
                return acc;
            },
            {} as Record<number, number>
        );

        const useExpScaling = (active: boolean, dist: number) => {
            const value = active
                ? Math.round(
                      Math.pow(1 - dist / maxDistance, exponentialScaling) * 100
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
        const newDataPoints = { ...dataPoints };
        Object.entries(distances)
            .sort((a, b) => a[1] - b[1])
            .forEach(([id, dist], idx) => {
                if (!$embeddedConcepts[id]) return;
                const active = idx < conceptLimit;
                const embedWeight = useExponentialScaling
                    ? useExpScaling(active, dist)
                    : useStdScaling(active, dist);
                newWeights[id] = embedWeight;
                const newDataPoint = { ...newDataPoints[id]};
                newDataPoint.opacity = getWeightOpacity(embedWeight);
                newDataPoint.connected = active;
                newDataPoints[id] = newDataPoint;
            });

        console.log("weights updated")
        weights = newWeights;
        dataPoints = newDataPoints;
    }

    function getEmbedClusterSets() {
        let embeds = Object.entries($embeddedConcepts);

        const padArray = (n: number) => new Array(n).fill(null).map(() => []);

        console.log("clustering embeddings");
        const set2 =
            embeds.length >= 2
                ? getKMeansClusters(
                      embeds.map((e) => e[1]),
                      2
                  )
                : [embeds.map((e) => e[0])];
        console.log("set of 2 complete");
        const set4 =
            embeds.length >= 4
                ? getKMeansClusters(
                      embeds.map((e) => e[1]),
                      4
                  )
                : set2;
        console.log("set of 4 complete");
        const set6 =
            embeds.length >= 6
                ? getKMeansClusters(
                      embeds.map((e) => e[1]),
                      6
                  )
                : set4;
        console.log("set of 6 complete");
        const set8 =
            embeds.length >= 8
                ? getKMeansClusters(
                      embeds.map((e) => e[1]),
                      8
                  )
                : set6;
        console.log("set of 8 complete");
        return {
            2: [...set2, ...padArray(2 - set2.length)],
            4: [...set4, ...padArray(4 - set4.length)],
            6: [...set6, ...padArray(6 - set6.length)],
            8: [...set8, ...padArray(8 - set8.length)],
        };
    }

    function updateDataPoints() {
        console.log("updating data points")
        if (!$embeddedConcepts || !scaledEmbedMappings) return;
        const ids = Object.keys(scaledEmbedMappings);

        const findAverageClusterPoint = (cluster: number[]) => {
            if (!cluster.length) return center;
            const points = cluster.map((i) => newDataPoints[i].xy);
            return avgPoint(points);
        };

        const newDataPoints = ids.reduce((acc, id, idx) => {
            acc[id] = {
                xy: scaledEmbedMappings[id],
                text: id,
                connected: true,
                opacity: 1,
            };
            return acc;
        }, {} as Record<string, PointData>);

        embedClusterSets = getEmbedClusterSets();
        if (clusterCount && embedClusterSets) {
            const k = clusterCount;
            const clusters = embedClusterSets[k];
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
            useExponentialScaling,
            exponentialScaling,
            conceptLimit
        );
    }

    function updateEmbedConceptLimit(value: number) {
        if (value > 0 && value <= conceptCount) {
            conceptLimit = Math.round(value);
        }
    }

    function toggleExponentialScaling() {
        useExponentialScaling = !useExponentialScaling;
    }

    function updateExponentialScaling(value: number) {
        exponentialScaling = value;
    }

    function updateClusterCount(count: number) {
        if ([0, 2, 4, 6, 8].indexOf(count) === -1) return;

        clusterCount = count;
    }

    async function shuffleEmbeddinMap() {
        scaledEmbedMappings = get2DEmbeddings($embeddedConcepts);
    }

    onMount(() => {
        shuffleEmbeddinMap();
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
    {useExponentialScaling}
    {toggleExponentialScaling}
    {exponentialScaling}
    setExponentialScaling={updateExponentialScaling}
    connectionLimit={conceptLimit}
    setConnectionLimit={updateEmbedConceptLimit}
    maxConnectionLimit={conceptCount}
    {clusterCount}
    setClusterCount={updateClusterCount}
    maxClusterCount={conceptCount}
    onShuffle={shuffleEmbeddinMap}
/>
