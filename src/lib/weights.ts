export function humanizeWeight(weight: number) {
    return Math.round(weight * 100);
}

export function getWeightOpacity(weight: number) {
    return Math.max(1 - Math.pow(1 - weight, 2), 0.25).toFixed(2);
}

export function getHighestWeight(ap) {
    const weightMode = ap.weightMode;
    let weightKey = "parsedWeight";
    switch(weightMode) {
        case "circle": weightKey = "circleWeight"; break;
        case "bars": weightKey = "barWeight"; break;
        case "embed": weightKey = "embedWeight"; break;
        case "pie": weightKey = "pieWeight"; break;
    }

    if(!ap.weightedPrompts) return 0;

    return Math.max(...Object.values(ap.weightedPrompts).map((p) => p[weightKey]));
}

export function getTotalWeight(ap) {
    const weightMode = ap.weightMode;
    let weightKey = "parsedWeight";
    switch(weightMode) {
        case "circle": weightKey = "circleWeight"; break;
        case "bars": weightKey = "barWeight"; break;
        case "embed": weightKey = "embedWeight"; break;
        case "pie": weightKey = "pieWeight"; break;
    }
    
    if(!ap.weightedPrompts) return 0;

    return Object.values(ap.weightedPrompts).reduce((acc, p) => acc + p[weightKey], 0);
}

export function getRelativeWeight(ap, id) {
    const weightMode = ap.weightMode;
    let weightKey = "parsedWeight";
    switch(weightMode) {
        case "circle": weightKey = "circleWeight"; break;
        case "bars": weightKey = "barWeight"; break;
        case "embed": weightKey = "embedWeight"; break;
        case "pie": weightKey = "pieWeight"; break;
    }
    
    if(!ap.weightedPrompts[id]) return 0;

    return ap.weightedPrompts[id][weightKey] / getHighestWeight(ap);
}


export function getDisplayWeight(ap, id) {
    const weightMode = ap.weightMode;
    let weightKey = "parsedWeight";
    switch(weightMode) {
        case "circle": weightKey = "circleWeight"; break;
        case "bars": weightKey = "barWeight"; break;
        case "embed": weightKey = "embedWeight"; break;
        case "pie": weightKey = "pieWeight"; break;
    }

    if(!ap.weightedPrompts[id]) return 0;

    const w = ap.weightedPrompts[id][weightKey];
    return humanizeWeight((w || 0) / getTotalWeight(ap));
}