<script>
    import Circle from "../components/Circle.svelte";
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
            angle: 45,
            radius: 10,
            text: '2000s lofi photography of a chill apartment.'
        },
        2: {
            id: 2,
            angle: 201,
            radius: 10,
            text: 'Young woman playing modular synthesizer.'
        },
        3: {
            id: 3,
            angle: 95,
            radius: 10,
            text: 'Candid synthwave lofi photography.'
        },
        4: {
            id: 4,
            angle: 288,
            radius: 10,
            text: "The haunting melody of a lonesome minstrel's lament."
        }
    };
    
    let pointData = computePointData();

    function getTextBoxDimensions(point) {
        const estimatedLines = Math.floor(point.text.length / 25) + 1;
        const height = estimatedLines * 20;
        return [textWidth, height];
    }

    function findBoxCenterOffset(textDimensions) {
        return multiply(textDimensions, 0.5)
    }

    function angleToPoint(cxy, radius, angle) {
        // Convert angle to radians
        const rad = (angle % 360) * Math.PI / 180;

        const offset = [radius * Math.cos(rad), radius * Math.sin(rad)];
        return add(cxy, offset);
    }

    function pointToAngle(pxy, cxy) {
            const dx = pxy[0] - cxy[0];
            const dy = pxy[1] - cxy[1];
            const angle = 360 + Math.atan2(dy, dx) * 180 / Math.PI;
            return angle % 360;
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
        let angle = pointToAngle(pxy, center) - 180;
        if (angle < 0) {
            angle += 360;
        }
        const offset = pointOnBoundary(textDimensions, angle);

        const diff = subtract(pxy, offset);

        return add(pxy, offset);
    }

    function pointInCircle(pxy, cxy, radius) {
        const dx = pxy[0] - cxy[0];
        const dy = pxy[1] - cxy[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < radius;
    }

    function closestPointOnCircle(pxy, cxy, radius) {
        const dx = pxy[0] - cxy[0];
        const dy = pxy[1] - cxy[1];
        const distance = Math.sqrt(dx * dx + dy * dy);
        const ratio = radius / distance;
        const x = cxy[0] + dx * ratio;
        const y = cxy[1] + dy * ratio;
        return [x, y];
    }

    function handleMouseMove(e) {
        mouseLocation = [e.clientX, e.clientY];
        if (activePoint === 'main') {
            // activePoint.angle = pointToAngle(mouseLocation, center);
            if(pointInCircle(mouseLocation, center, radius)) {
                marker = mouseLocation;
            } else {
                marker = closestPointOnCircle(mouseLocation, center, radius);
            }
            pointData = computePointData();
        } else if (activePoint) {
            const point = {...points[activePoint]};
            const c = closestPointOnCircle(mouseLocation, center, radius); 
            point.angle = pointToAngle(c, center);
            points[activePoint] = point;
            pointData = computePointData();
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

    function computePointData() {
        // set points
        let pd = Object.entries(points).reduce((acc, [id, point]) => {
            acc[id] = {xy: angleToPoint(center, radius, point.angle) };
            return acc;
        }, {});

        // add distances
        pd = Object.entries(pd).reduce((acc, [id, point]) => {
            acc[id] = {...acc[id], distance: getDistance(point.xy, marker)};
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
    <Circle xy={center} radius={radius} />

    {#each Object.entries(points) as [id, point]}
        <Line p1={marker} p2={pointData[id].xy} />
        <Point xy={pointData[id].xy} radius={point.radius} color={'rgba(76,97,141, 1)'} handleMouseDown={()=>activatePoint(id)}/>
        <PromptText xy={getTextLocation(pointData[id].xy, getTextBoxDimensions(point))} color={`rgba(255,255,255,${getWeightOpacity(pointData[id].unitWeight)}`} wh={getTextBoxDimensions(point)} text={point.text} />
        <WeightMarker xy={multiply(add(marker, pointData[id].xy), 0.5)} weight={(pointData[id].unitWeight * 100).toFixed(0)} radius={15} textColor={`rgba(255,255,255,${getWeightOpacity(pointData[id].unitWeight)}`} bgColor={`rgb(8, 11, 22)`} />
    {/each}

    <Point xy={marker} radius={10} color='rgba(136,157,191, 1)' handleMouseDown={()=>activatePoint('main')}/>
</svg>