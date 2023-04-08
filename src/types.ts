export type Vec2 = [number, number];

export type Directive = {
    name: string;
    text: string;
    builtIn: boolean;
};

export type DirectiveDict = { [id: string]: Directive };

export type WeightedPrompt = {
    id: number;
    text: string;
    barWeight: number;
    parsedWeight: number;
    circleWeight?: number;
    embedWeight?: number;
    pieWeight?: number;
}

export type WeightedPromptDict = { [id: string]: WeightedPrompt };

export enum WeightMode {
    Circle = "circle",
    Bars = "bars",
    Embed = "embed",
    Pie = "pie",
}

export type MultiPrompt = {
    weightedPrompts: WeightedPromptDict;
    weightMode: WeightMode;
    pieAngles: { [id: string]: number };
    circleAngles: { [id: string]: number };
    circleMarker: Vec2;
    circleWeightScaling: number;
    circleExponentialScaling: boolean;
    embedWeightScaling: number;
    embedExponentialScaling: boolean;
    embedClusters: 0 | 2 | 4 | 6 | 8;
    embedPromptLimit: number;
}