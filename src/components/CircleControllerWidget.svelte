<script lang="ts">
    type ActivePoint = string | number | null;
    import { add, multiply, subtract, isUndefined } from "mathjs";
    import Circle from "./Circle.svelte";
    import Point from "./Point.svelte";
    import Line from "./Line.svelte";
    import PromptText from "./PromptText.svelte";
    import WeightMarker from "./WeightMarker.svelte";
    import {
        activePromptStore,
        activePrompt,
    } from "../lib/activePromptStore.js";
    import {
        pointToPolar,
        polarToPoint,
        closestPointOnCircle,
        pointInCircle,
        pointOnBoundary,
    } from "../lib/circle";
    import { getDisplayWeight, getWeightOpacity } from "../lib/weights";
    import { getTextBoxDimensions } from "../lib/text";
    import { getDistance, findBoxCenter } from "../lib/vector";

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
            Object.keys($activePrompt.circleAngles).length !==
            Object.keys($activePrompt.weightedPrompts).length
        ) {
            activePromptStore.updateActivePrompt({
                ...$activePrompt,
                circleAngles: initializeAngles(
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
        $activePrompt.circleWeightScaling,
        $activePrompt.circleExponentialScaling,
        $activePrompt.circleMarker,
        $activePrompt.circleAngles ||
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
        const svg = e.currentTarget;
        var pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
        mouseLocation = [loc.x, loc.y];
        if (activePoint === "main") {
            const markerLocation = pointInCircle(mouseLocation, center, radius)
                ? pointToPolar(mouseLocation, center, radius)
                : pointToPolar(
                      closestPointOnCircle(mouseLocation, center, radius),
                      center,
                      radius
                  );
            pointData = computePointData(
                $activePrompt.weightedPrompts,
                center,
                radius,
                $activePrompt.circleWeightScaling,
                $activePrompt.circleExponentialScaling,
                markerLocation,
                $activePrompt.circleAngles
            );
        } else if (activePoint) {
            const point = { ...$activePrompt.weightedPrompts[activePoint] };
            const c = closestPointOnCircle(mouseLocation, center, radius);
            const angle = pointToPolar(c, center, radius)[0];

            const ca = { ...$activePrompt.circleAngles };
            ca[point.id] = angle;

            const wp = { ...$activePrompt.weightedPrompts };
            wp[activePoint] = point;

            pointData = computePointData(
                wp,
                center,
                radius,
                $activePrompt.circleWeightScaling,
                $activePrompt.circleExponentialScaling,
                $activePrompt.circleMarker,
                ca
            );
        }
    }

    function computePointData(
        weightedPrompts,
        center,
        radius,
        circleWeightScaling,
        circleExponentialScaling,
        circleMarker,
        circleAngles
    ) {
        if (
            !weightedPrompts ||
            !center ||
            !radius ||
            !circleWeightScaling ||
            !circleMarker
        ) {
            return null;
        }

        // set points
        let pd = Object.entries(weightedPrompts).reduce((acc, [id, point]) => {
            acc[id] = {
                xy: polarToPoint(center, [circleAngles[id], 1], radius),
            };
            return acc;
        }, {});

        // add distances
        pd = Object.entries(pd).reduce((acc, [id, point]) => {
            acc[id] = {
                ...acc[id],
                distance: getDistance(
                    point.xy,
                    polarToPoint(center, circleMarker, radius)
                ),
            };
            return acc;
        }, pd);

        // find total distance
        const totalDistance = Object.values(pd).reduce(
            (acc, point) => acc + point.distance,
            0
        );

        // add unit distances
        pd = Object.entries(pd).reduce((acc, [id, point]) => {
            acc[id] = {
                ...acc[id],
                unitDistance:
                    Math.round((point.distance / totalDistance) * 100) / 100,
            };
            return acc;
        }, pd);

        // add inverted unit distances
        pd = Object.entries(pd).reduce((acc, [id, point]) => {
            acc[id] = {
                ...acc[id],
                invertedUnitDistance:
                    Math.round((1 - point.unitDistance) * 100) / 100,
            };
            return acc;
        }, pd);

        // add unit weights
        pd = Object.entries(pd).reduce((acc, [id, point]) => {
            if (circleExponentialScaling) {
                acc[id] = {
                    ...acc[id],
                    unitWeight:
                        Math.round(
                            Math.pow(
                                1 - point.distance / (2 * radius),
                                circleWeightScaling
                            ) * 100
                        ) / 100,
                };
            } else {
                acc[id] = {
                    ...acc[id],
                    unitWeight:
                        Math.round((1 - point.distance / (2 * radius)) * 100) /
                        100,
                };
            }
            return acc;
        }, pd);

        // get weights by id

        const wp = { ...weightedPrompts };
        Object.entries(pd).forEach(([id, data]) => {
            wp[id].circleWeight = data.unitWeight;
        });

        activePromptStore.updateActivePrompt({
            ...$activePrompt,
            circleMarker,
            weightedPrompts: wp,
            circleAngles,
        });

        return pd;
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
            <Line
                p1={polarToPoint(center, $activePrompt.circleMarker, radius)}
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
                    pointData[id].xy,
                    getTextBoxDimensions(textWidth, point.text.length, fontSize)
                )}
                color={`rgba(255,255,255,${getWeightOpacity(
                    pointData[id].unitWeight
                )}`}
                wh={getTextBoxDimensions(textWidth, point.text.length, fontSize)}
                fontSize={fontSize}
                text={point.text}
            />
            <WeightMarker
                xy={multiply(
                    add(
                        polarToPoint(
                            center,
                            $activePrompt.circleMarker,
                            radius
                        ),
                        pointData[id].xy
                    ),
                    0.5
                )}
                weight={getDisplayWeight($activePrompt.weightedPrompts[id], $activePrompt.weightMode)}
                radius={15}
                textColor={`rgba(255,255,255,${getWeightOpacity(
                    pointData[id].unitWeight
                )}`}
                bgColor={`rgb(8, 11, 22)`}
            />
        {/each}

        {#if Object.entries($activePrompt.weightedPrompts).length > 0}
            <Point
                xy={polarToPoint(center, $activePrompt.circleMarker, radius)}
                radius={10}
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
