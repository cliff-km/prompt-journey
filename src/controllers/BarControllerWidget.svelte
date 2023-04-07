<script lang="ts">
    import Bar from "../svg/Bar.svelte";
    import PromptText from "../svg/PromptText.svelte";
    import {
        activePromptStore,
        activePrompt,
    } from "../stores/activePromptStore.js";
    import { humanizeWeight, getWeightOpacity } from "../lib/weights";
    import { getTextBoxDimensions } from "../lib/text";
    import { getSVGMouseLocation } from "../lib/vector";

    // display state
    export let center = [0, 0];
    export let dimensions = [100, 100];
    export let maxWidth = 1000;
    export let pointRadius = 10;
    export let textWidth = 250;
    export let horizontalPad = 20;
    export let verticalPad = 2;
    export let textBarPad = 10;
    export let fontSize = 13;
    export let handleWidth = 20;

    $: prompts = Object.entries($activePrompt.weightedPrompts).map(
        ([id, prompt], idx) => {
            return [id, idx, prompt];
        }
    );
    $: promptCount = Object.keys($activePrompt.weightedPrompts).length;
    $: wh = [dimensions[0] - 50, dimensions[1] - 50];
    $: textDimensions = prompts.reduce((acc, [id, idx, p]) => {
        const [w, h] = getTextBoxDimensions(textWidth, p.text.length, fontSize);
        acc[id] = [w, h];
        return acc;
    }, {});
    $: maxTextHeight = Math.max(
        ...Object.values(textDimensions).map(([w, h]) => h)
    );
    $: barHeight = Math.min(wh[1] / promptCount, maxTextHeight);
    $: actualHeight =
        barHeight * promptCount + verticalPad * Math.max(promptCount - 1, 0);
    $: actualWidth = Math.min(wh[0], maxWidth);
    $: xy = [center[0] - actualWidth / 2, center[1] - actualHeight / 2];
    $: maxBarWidth =
        actualWidth - textBarPad - textWidth - 2 * horizontalPad - handleWidth;
    $: barX = xy[0] + textBarPad + textWidth + horizontalPad;
    $: maxBarWeight = Math.max(
        ...Object.values($activePrompt.weightedPrompts).map(
            (p) => p.barWeight || 0
        )
    );

    let getColor = (n: number) => `rgba(46,67,101, ${n})`;
    let getHandleColor = (n: number) => `rgba(76,97,131, ${n})`;
    let hoverEmptyId = null;
    let hoverBarId = null;
    let hoverHandleId = null;
    let baseHandleColor = getHandleColor(0.3);
    let hoverHandleColor = getHandleColor(0.8);
    let activeDragId = null;
    let mouseHoldInterval = null;
    let mouseHoldStart = null;

    function handleMouseOver(id, e: Event) {
        hoverBarId = id;
    }

    function handleMouseOverEmpty(id, e: Event) {
        hoverEmptyId = id;
    }

    function handleMouseOverHandle(id, e: Event) {
        hoverHandleId = id;
    }

    function handleMouseOut(id, e: Event) {
        hoverBarId = null;
    }

    function handleMouseOutEmpty(id, e: Event) {
        hoverEmptyId = null;
    }

    function handleMouseOutHandle(id, e: Event) {
        hoverHandleId = null;
    }

    function handleMouseDown(id, e: Event) {
        activeDragId = id;
    }

    function handleDoubleClick(e: Event) {
        let targetId =
            activeDragId || hoverBarId || hoverHandleId || hoverEmptyId;
        if (!targetId) return;
        const mouseLocation = getSVGMouseLocation(e);
        useLocationToUpdateWeight(targetId, mouseLocation);
    }

    function handleMouseUp(e: Event) {
        activeDragId = null;
        clearInterval(mouseHoldInterval);
        mouseHoldInterval = null;
        mouseHoldStart = null;
    }

    function useLocationToUpdateWeight(targetId, xy) {
        let barLength = Math.min(maxBarWidth, Math.max(0, xy[0] - barX));
        let barRatio = barLength / maxBarWidth;
        let prompts = { ...$activePrompt.weightedPrompts };
        let wp = { ...prompts[targetId] };
        wp.barWeight = barRatio;

        prompts[targetId] = wp;
        activePromptStore.update({
            ...$activePrompt,
            weightedPrompts: prompts,
        });
    }

    function handleMouseMove(e: Event) {
        let targetId = activeDragId;
        if (!targetId) return;

        const mouseLocation = getSVGMouseLocation(e);
        useLocationToUpdateWeight(targetId, mouseLocation);
        if (activeDragId) {
            //determine if mouse is beyond end
            let barEnd = barX + maxBarWidth + handleWidth;
            let barStart = barX;
            if (mouseLocation[0] > barEnd && !mouseHoldInterval) {
                mouseHoldStart = Date.now();
                mouseHoldInterval = setInterval(() => {
                    if (Date.now() - mouseHoldStart < 1000) {
                        return;
                    }
                    let prompts = { ...$activePrompt.weightedPrompts };
                    const updatedPrompts = Object.entries(prompts).reduce(
                        (acc, [id, p]) => {
                            if (id !== activeDragId) {
                                acc[id] = {
                                    ...p,
                                    barWeight: Math.max(
                                        0,
                                        (p.barWeight || 0) - 0.01
                                    ),
                                };
                            } else {
                                acc[id] = {
                                    ...p,
                                    barWeight: Math.min(
                                        1,
                                        (p.barWeight || 0) + 0.01
                                    ),
                                };
                            }
                            return acc;
                        },
                        {}
                    );
                    activePromptStore.update({
                        ...$activePrompt,
                        weightedPrompts: updatedPrompts,
                    });
                }, 100);
            } else if (mouseLocation[0] < barStart && !mouseHoldInterval) {
                mouseHoldStart = Date.now();
                mouseHoldInterval = setInterval(() => {
                    if (Date.now() - mouseHoldStart < 1000) {
                        return;
                    }
                    let prompts = { ...$activePrompt.weightedPrompts };
                    const updatedPrompts = Object.entries(prompts).reduce(
                        (acc, [id, p]) => {
                            if (id !== activeDragId) {
                                acc[id] = {
                                    ...p,
                                    barWeight: Math.min(
                                        1,
                                        (p.barWeight || 0) + 0.01
                                    ),
                                };
                            } else {
                                acc[id] = {
                                    ...p,
                                    barWeight: Math.max(
                                        0,
                                        (p.barWeight || 0) - 0.01
                                    ),
                                };
                            }
                            return acc;
                        },
                        {}
                    );
                    activePromptStore.update({
                        ...$activePrompt,
                        weightedPrompts: updatedPrompts,
                    });
                }, 100);
            } else if (
                mouseLocation[0] < barEnd &&
                mouseLocation[0] > barStart &&
                mouseHoldInterval
            ) {
                clearInterval(mouseHoldInterval);
                mouseHoldInterval = null;
                mouseHoldStart = null;
            }
        }
    }
</script>

<svg
    id="svg"
    class="w-full h-full"
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:dblclick={handleDoubleClick}
>
    {#each prompts as [id, idx, p] (id)}
        <PromptText
            xy={[xy[0] + horizontalPad, xy[1] + idx * barHeight + idx]}
            color={`rgba(255,255,255,${getWeightOpacity(
                p.barWeight / maxBarWeight || 0
            )})`}
            wh={textDimensions[id]}
            text={p.text}
            textAlign="right"
            {fontSize}
        />
        <Bar
            color={getColor(0)}
            handleMouseOver={(e) => handleMouseOverEmpty(id, e)}
            handleMouseOut={(e) => handleMouseOutEmpty(id, e)}
            xy={[barX, xy[1] + idx * barHeight + idx]}
            wh={[maxBarWidth, barHeight - 2]}
        />
        <Bar
            color={hoverBarId === id ||
            hoverEmptyId === id ||
            hoverHandleId === id
                ? getColor(
                      getWeightOpacity((p.barWeight || 0) / maxBarWeight + 0.15)
                  )
                : getColor(getWeightOpacity(p.barWeight || 0))}
            handleMouseOver={(e) => handleMouseOver(id, e)}
            handleMouseOut={(e) => handleMouseOut(id, e)}
            xy={[barX, xy[1] + idx * barHeight + idx]}
            wh={[(p.barWeight || 0) * maxBarWidth, barHeight - 2]}
        />
        <Bar
            color={hoverHandleId === id ? hoverHandleColor : baseHandleColor}
            handleMouseOver={(e) => handleMouseOverHandle(id, e)}
            handleMouseOut={(e) => handleMouseOutHandle(id, e)}
            handleMouseDown={(e) => handleMouseDown(id, e)}
            xy={[
                barX + (p.barWeight || 0) * maxBarWidth,
                xy[1] + idx * barHeight + idx,
            ]}
            wh={[handleWidth, barHeight - 2]}
        />
    {/each}
</svg>

<style>
    :global(svg) {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
