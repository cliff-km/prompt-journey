export function humanizeWeight(weight: number) {
    return Math.round(weight * 100);
}

export function getWeightOpacity(weight: number) {
    return Math.max(1 - Math.pow(1 - weight, 2), 0.25).toFixed(2);
}

export function getDisplayWeight(wp, weightMode) {
    const w = weightMode === "circle" ? wp["circleWeight"] : weightMode === "bars" ? wp["barWeight"] : wp["parsedWeight"];
    return humanizeWeight(w || 0);
}