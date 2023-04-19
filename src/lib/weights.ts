import { WeightMode, type MultiPrompt } from "../types";

export function humanizeWeight(weight: number) {
    return Math.round(weight * 100);
}

export function getWeightOpacity(weight: number):number {
    return Math.round(Math.max(1 - Math.pow(1 - weight, 2), 0.25)*100)/100;
}

export function getWeightKey(weightMode: WeightMode) {
    let weightKey = "parsedWeight";
    switch(weightMode) {
        case WeightMode.Circle: weightKey = "circleWeight"; break;
        case WeightMode.Bars: weightKey = "barWeight"; break;
        case WeightMode.Embed: weightKey = "embedWeight"; break;
        case WeightMode.Pie: weightKey = "pieWeight"; break;
        case WeightMode.Ring: weightKey = "ringWeight"; break;
        case WeightMode.Random: weightKey = "randomWeight"; break;
    }
    return weightKey;
}

export function getHighestWeight(ap: MultiPrompt) {
    const weightMode = ap.weightMode;
    const weightKey = getWeightKey(weightMode);

    if(!ap.weightedPrompts) return 0;

    return Math.max(...Object.values(ap.weightedPrompts).map((p) => p[weightKey]));
}

export function getTotalWeight(ap: MultiPrompt) {
    const weightMode = ap.weightMode;
    const weightKey = getWeightKey(weightMode);
    
    if(!ap.weightedPrompts) return 0;

    return Object.values(ap.weightedPrompts).reduce((acc, p) => acc + p[weightKey], 0);
}

export function getRelativeWeight(ap: MultiPrompt, id: number) {
    const weightMode = ap.weightMode;
    const weightKey = getWeightKey(weightMode);
    
    if(!ap.weightedPrompts[id]) return 0;

    return ap.weightedPrompts[id][weightKey] / getHighestWeight(ap);
}


export function getDisplayWeight(ap: MultiPrompt, id: number) {
    const weightMode = ap.weightMode;
    const weightKey = getWeightKey(weightMode);

    if(!ap.weightedPrompts[id]) return 0;

    const w = ap.weightedPrompts[id][weightKey];
    return humanizeWeight((w || 0) / getTotalWeight(ap));
}