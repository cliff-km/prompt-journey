<script>
    import Point from "../components/Point.svelte";
    import Line from "../components/Line.svelte";
    import PromptText from "../components/PromptText.svelte";
    import WeightMarker from "../components/WeightMarker.svelte";
    import { add, multiply, subtract } from "mathjs";

    let center = [550, 400];
    let radius = 250;
    let textWidth = 150;
    let scaling = 5;

    let marker = [650, 350];
    let mouseLocation = [0, 0];
    let activePoint = null;

    let points = {
        1: {
            id: 1,
            xy: [100, 100],
            radius: 10,
            text: 'A beautiful tequila bottle.'
        },
        2: {
            id: 2,
            xy: [200, 200],
            radius: 10,
            text: 'A beautiful sake bottle.'
        },
        3: {
            id: 3,
            xy: [300, 300],
            radius: 10,
            text: 'A glass tea kettle.'
        },
        4: {
            id: 4,
            xy: [400, 400],
            radius: 10,
            text: "A glass vase full of flowers."
        },
        5: {
            id: 4,
            xy: [500, 500],
            radius: 10,
            text: "A beautiful glass decanter."
        },
        6: {
            id: 4,
            xy: [100, 500],
            radius: 10,
            text: "Glass art by Chihuly."
        },
        7: {
            id: 4,
            xy: [500, 100],
            radius: 10,
            text: "Glass art by Iitala."
        }
    };
    
    let pointData = computePointData(points);

    let closestPoints = getClosestPoints();
    let closePointData = computePointData(closestPoints);


    function getClosestPoints() {
        const ids =  Object.entries(pointData).sort(([aId, aVal], [bId, bVal]) => aVal.distance - bVal.distance).slice(0, 4).map(([id, val]) => id);
        const closePoints = Object.entries(points).reduce((acc, [id, point]) => {
            if (ids.includes(id)) {
                acc[id] = point;
            }
            return acc;
        }, {});
        return closePoints;
    }


    function getTextBoxDimensions(point) {
        const estimatedLines = Math.floor(point.text.length / 25) + 1;
        const height = estimatedLines * 20;
        return [textWidth, height];
    }

    function handleMouseMove(e) {
        mouseLocation = [e.clientX, e.clientY];
        if (activePoint === 'main') {
            // activePoint.angle = pointToAngle(mouseLocation, center);
            marker = mouseLocation;
            pointData = computePointData(points);
            closestPoints = getClosestPoints();
            closePointData = computePointData(closestPoints);
        } else if (activePoint) {
            const point = {...points[activePoint]}; 
            point.xy = mouseLocation;
            points[activePoint] = point;
            pointData = computePointData(points);
            closestPoints = getClosestPoints();
            closePointData = computePointData(closestPoints);
        }
    }

    function handleMouseUp(e) {
        activePoint = null;
    }

    function activatePoint(pointId) {
        activePoint = pointId;
    }

    function getDistance(p1, p2) {
        const dx = p1[0] - p2[0];
        const dy = p1[1] - p2[1];
        return Math.sqrt(dx * dx + dy * dy);
    }

    function computePointData(points) {

        // add distances
        let pd = Object.entries(points).reduce((acc, [id, point]) => {
            acc[id] = {distance: getDistance(point.xy, marker)};
            return acc;
        }, {});

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
            acc[id] = {...acc[id], unitWeight: Math.round(Math.pow(point.invertedUnitDistance, scaling) * 100) / 100};
            return acc;
        }, pd);

        return pd;
    }

    function getWeightOpacity(weight) {
        return Math.max(1 - Math.pow(1 - weight, 2), 0.25).toFixed(2);
    }
</script>

<style>
    :global(svg) {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>

<svg id="svg" on:mousemove={handleMouseMove} on:mouseup={handleMouseUp}>
    {#each Object.entries(points) as [id, point]}
        {#if Object.keys(closestPoints).includes(id)}
            <Line p1={marker} p2={point.xy} />
            <WeightMarker xy={multiply(add(marker, point.xy), 0.5)} weight={(closePointData[id].unitWeight * 100).toFixed(0)} radius={15} textColor={`rgba(255,255,255,${getWeightOpacity(closePointData[id].unitWeight)}`} bgColor={`rgb(8, 11, 22)`} />
            <PromptText xy={point.xy} color={`rgba(255,255,255,${getWeightOpacity(closePointData[id].unitWeight)}`} wh={getTextBoxDimensions(point)} text={point.text} />
        {/if}
        <Point xy={point.xy} radius={point.radius} color={'rgba(76,97,141, 1)'} handleMouseDown={()=>activatePoint(id)}/>
        <PromptText xy={point.xy} color={`rgba(255,255,255,0.20`} wh={getTextBoxDimensions(point)} text={point.text} />
    {/each}

    <Point xy={marker} radius={10} color='rgba(136,157,191, 1)' handleMouseDown={()=>activatePoint('main')}/>
</svg>