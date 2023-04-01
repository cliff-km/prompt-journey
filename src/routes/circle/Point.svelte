<script>
    export let xy = [100, 100];
    export let radius = 5;
    export let color = 'black';
    export let hoverColor = 'white';
    export let handleMouseDown = ()=>{};

    let c = color;

	function handleMouseOver() {
		c = hoverColor;
	}
	function handleMouseOut() {
		c = color;
	}
    function _handleMouseDown(e) {
        console.log('mousedown');
        handleMouseDown(e);
    }
</script>

<circle cx={xy[0]} cy={xy[1]} r={radius} style:fill={c} 
    on:mouseover={handleMouseOver}
    on:mouseout={handleMouseOut}
    on:mousedown={_handleMouseDown}
/>