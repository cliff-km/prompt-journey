<script>
    import { onMount } from "svelte";

    onMount(() => {
        const canvas = document.getElementById('circleCanvas');
        const ctx = canvas.getContext('2d');
        ctx.font = "20px Arial";
        const radius = canvas.width / 2 - 50;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scaling = 3;
        
        let pointX = centerX;
        let pointY = centerY;

        let outterPoints = {
            a: {
                color: 'red',
                angle: 0
            },
            b: {
                color: 'orange',
                angle: 72
            },
            c: {
                color: 'yellow',
                angle: 144
            },
            d: {
                color: 'green',
                angle: 216
            },
            e: {
                color: 'blue',
                angle: 288
            }
        }

        function getPointAngle(xy) {
            const dx = xy[0] - centerX;
            const dy = xy[1] - centerY;
            const angle = Math.atan2(dy, dx);
            return angle;
        }

        // Draw the circle
        function drawCircle() {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // Draw points on the edge of the circle
        function getBorderPointLocation(angle) {
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return [x, y];
        }

        // Draw points inside of the circle
        function drawPoint(xy, color) {
            //console.log('draw point', xy, color);
            
            ctx.beginPath();
            ctx.arc(xy[0], xy[1], 5, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
        }

        // Measure distance between two points
        function measureDistance(xy1, xy2) {
            return Math.sqrt(Math.pow(xy2[0] - xy1[0], 2) + Math.pow(xy2[1] - xy1[1], 2));
        }

        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt((dx * dx) + (dy * dy));
            console.log('click', [x, y], [centerX, centerY], distance, radius);

            if (distance < radius) {
                console.log('update point', [x, y]);
                pointX = x;
                pointY = y;
            }
        });


        function unit(dists) {
            const total = dists.reduce((a, b) => a + b, 0);
            const unit = dists.map(d => Math.round((d / total) * 100) / 100);
            return unit;
        }

        function invertUnit(unit) {
            const dists = unit.map(u => Math.round((1 - u) * 100) / 100);
            return dists;
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.setLineDash([]);
            drawCircle();

            drawPoint([pointX, pointY], 'black');

            const distances = [];

            for (let key in outterPoints) {
                const point = outterPoints[key];
                const angle = point.angle * Math.PI / 180;

                const loc = getBorderPointLocation(angle);
                

                ctx.beginPath();
                ctx.setLineDash([3, 10]);/*dashes are 5px and spaces are 3px*/
                ctx.moveTo(pointX, pointY);
                ctx.lineTo(loc[0], loc[1]);
                ctx.stroke();
                ctx.fillStyle = point.color;
                const dist = measureDistance(loc, [pointX, pointY]);
                distances.push(dist)
                //ctx.fillText(dist.toFixed(1), loc[0], loc[1]);

                drawPoint(loc, point.color);
            }

            ctx.fillStyle = 'black';

            const unitWeights = unit(invertUnit(unit(distances)).map(u => Math.pow(u, scaling))).map(u => (u * 100).toFixed(0)).join(', ');
            ctx.fillText(unitWeights, pointX, pointY);

            requestAnimationFrame(animate);
        }

        animate();
    })
</script>

<canvas id="circleCanvas" width="600" height="600"></canvas>