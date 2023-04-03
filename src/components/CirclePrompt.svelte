<script lang="ts">
    type ActivePoint = string|number|null;
    import Circle from "./Circle.svelte";
    import Point from "./Point.svelte";
    import Line from "./Line.svelte";
    import PromptText from "./PromptText.svelte";
    import WeightMarker from "./WeightMarker.svelte";
    import { add, multiply, subtract } from "mathjs";
    import { pointToPolar, polarToPoint, closestPointOnCircle, pointInCircle } from "../lib/circle";
    import { humanizeWeight, getWeightOpacity } from "../lib/weights";
    import { getTextBoxDimensions, findBoxCenterOffset } from "../lib/text";

    export let handleWeightChange = (weightsById) => {};
    // display state
    export let center = [450, 450];
    export let radius = 250;
    export let pointRadius = 10;
    export let textWidth = 150;
    // data state
    export let points = {};
    export let pointAngles = initializeAngles(points, {});
    export let scaling = 20;
    export let exponentialScaling = true;
    export let marker = [0, 0];
    export let handleDataStateChange = (dataState) => {};

    let mouseLocation = [0, 0];
    let activePoint:ActivePoint = null;
    let pointData = computePointData(points, center, radius, scaling, exponentialScaling, marker);

    function initializeAngles(points, angles) {
        if(!points) return null;
        return Object.entries(points).reduce((acc, [id, point], idx) => {
            const angle = acc[id] || idx * (360 / Object.keys(points).length) - 90;
            acc[id] = angle;
            return acc;
        }, angles);
    }

    $: {
        recomputeState(points, center, radius, scaling, exponentialScaling, marker);
    }

    function recomputeState(points, center, radius, scaling, exponentialScaling, marker) {
        pointAngles = initializeAngles(points, pointAngles);
        pointData = computePointData(points, center, radius, scaling, exponentialScaling, marker);
        handleDataStateChange({points, pointAngles, scaling, exponentialScaling, marker});
    }

    function pointOnBoundary(wh, angle) {
        // Convert angle to radians
        const rad = (angle % 360) * Math.PI / 180;

        // Calculate the center of the box
        const cxy = findBoxCenterOffset(wh);
        
        let x, y;

        const c = Math.cos(rad);
        const s = Math.sin(rad);

        x = (cxy[0]+5) * -1.2 * c;
        y = (cxy[1]+5) * -1.2 * s;


        // The point's position will be relative to the center, so we need to add the center's coordinates
        x -= cxy[0];
        y -= cxy[1];

        return [x, y];
    }

    function getTextLocation(pxy, textDimensions) {
        let angle = pointToPolar(pxy, center, radius)[0] - 180;
        if (angle < 0) {
            angle += 360;
        }
        const offset = pointOnBoundary(textDimensions, angle);

        const diff = subtract(pxy, offset);

        return add(pxy, offset);
    }

    function handleMouseMove(e) {
        const svg = e.currentTarget;
        var pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
        mouseLocation = [loc.x, loc.y];
        if (activePoint === 'main') {
            if(pointInCircle(mouseLocation, center, radius)) {
                marker = pointToPolar(mouseLocation, center, radius);
            } else {
                marker = pointToPolar(closestPointOnCircle(mouseLocation, center, radius), center, radius);
            }
            pointData = computePointData(points, center, radius, scaling, exponentialScaling, marker);
        } else if (activePoint) {
            const point = {...points[activePoint]};
            const c = closestPointOnCircle(mouseLocation, center, radius); 
            const angle = pointToPolar(c, center, radius)[0];
            console.log('moving point', activePoint, mouseLocation, c, angle);
            pointAngles[point.id] = angle;
            points[activePoint] = point;
            pointData = computePointData(points, center, radius, scaling, exponentialScaling, marker);
        }
    }
    
    function handleMouseUp(e:Event) {
        activePoint = null;
    }

    function activatePoint(pointId:ActivePoint) {
        activePoint = pointId;
    }

    function getDistance(p1, p2) {
        const dx = p1[0] - p2[0];
        const dy = p1[1] - p2[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    function computePointData(points, center, radius, scaling, exponentialScaling, marker) {
        if(!points || !center || !radius || !scaling || !marker) {
            return null;
        }

        // set points
        let pd = Object.entries(points).reduce((acc, [id, point]) => {
            acc[id] = {xy: polarToPoint(center, [pointAngles[id], 1], radius) };
            return acc;
        }, {});

        // add distances
        pd = Object.entries(pd).reduce((acc, [id, point]) => {
            acc[id] = {...acc[id], distance: getDistance(point.xy, polarToPoint(center, marker, radius))};
            return acc;
        }, pd);

        // find total distance
        const totalDistance = Object.values(pd).reduce((acc, point) => acc + point.distance, 0);

        // add unit distances
        pd = Object.entries(pd).reduce((acc, [id, point]) => {
            acc[id] = {...acc[id], unitDistance: Math.round((point.distance / totalDistance) * 100) / 100};
            return acc;
        }, pd);

        // add inverted unit distances
        pd = Object.entries(pd).reduce((acc, [id, point]) => {
            acc[id] = {...acc[id], invertedUnitDistance: Math.round((1 - point.unitDistance) * 100) / 100};
            return acc;
        }, pd);

        // add unit weights
        pd = Object.entries(pd).reduce((acc, [id, point]) => {
            if(exponentialScaling) {
                acc[id] = {...acc[id], unitWeight: Math.round(Math.pow((1 - (point.distance / (2 * radius))), scaling) * 100) / 100};
            } else {
                acc[id] = {...acc[id], unitWeight: Math.round((1 - (point.distance / (2 * radius))) * 100) / 100};
            }
            return acc;
        }, pd);

        // get weights by id
        const weights = Object.entries(pd).reduce((acc, [id, data]) => {
            acc[id] = humanizeWeight(data.unitWeight);
            return acc;
        }, {});
        handleWeightChange(weights);

        return pd;
    }
</script>

<style>
    :global(svg) {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>

<svg id="svg" class="w-full h-full" on:mousemove={handleMouseMove} on:mouseup={handleMouseUp}>
    {#if pointData && points}
        <Circle xy={center} radius={radius} />

        {#each Object.entries(points) as [id, point]}
            <Line p1={polarToPoint(center, marker, radius)} p2={pointData[id].xy} />
            <Point xy={pointData[id].xy} radius={pointRadius} color={'rgba(76,97,141, 1)'} handleMouseDown={()=>activatePoint(id)}/>
            <PromptText xy={getTextLocation(pointData[id].xy, getTextBoxDimensions(point.text, textWidth))} color={`rgba(255,255,255,${getWeightOpacity(pointData[id].unitWeight)}`} wh={getTextBoxDimensions(point.text, textWidth)} text={point.text} />
            <WeightMarker xy={multiply(add(polarToPoint(center, marker, radius), pointData[id].xy), 0.5)} weight={humanizeWeight(pointData[id].unitWeight)} radius={15} textColor={`rgba(255,255,255,${getWeightOpacity(pointData[id].unitWeight)}`} bgColor={`rgb(8, 11, 22)`} />
        {/each}

        {#if Object.entries(points).length > 0}
            <Point xy={polarToPoint(center, marker, radius)} radius={10} color='rgba(136,157,191, 1)' handleMouseDown={()=>activatePoint('main')}/>
        {/if}
    {/if}
</svg>