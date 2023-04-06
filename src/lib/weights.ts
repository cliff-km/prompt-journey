export function humanizeWeight(weight: number) {
    return Math.round(weight * 100);
}

export function getWeightOpacity(weight: number) {
    return Math.max(1 - Math.pow(1 - weight, 2), 0.25).toFixed(2);
}

export function getDisplayWeight(wp, weightMode) {
    let weightKey = "parsedWeight";
    switch(weightMode) {
        case "circle": weightKey = "circleWeight"; break;
        case "bars": weightKey = "barWeight"; break;
        case "embed": weightKey = "embedWeight"; break;
        case "pie": weightKey = "pieWeight"; break;
    }
    const w = wp[weightKey];
    return humanizeWeight(w || 0);
}