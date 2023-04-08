export type Vec2 = [number, number];
export type VecN = number[];

export type Directive = {
    name: string;
    text: string;
    builtIn: boolean;
};

export type DirectiveDict = Record<string, Directive>;

export type WeightKey = "parsedWeight" | "barWeight" | "circleWeight" | "embedWeight" | "pieWeight";

export type WeightedPrompt = {
    id: number;
    text: string;
    barWeight: number;
    parsedWeight: number;
    circleWeight?: number;
    embedWeight?: number;
    pieWeight?: number;
}

export type WeightedPromptDict = Record<number, WeightedPrompt>;

export enum WeightMode {
    Circle = "circle",
    Bars = "bars",
    Embed = "embed",
    Pie = "pie",
}

export type Embeddings = Record<number, VecN>;

export type MultiPrompt = {
    weightedPrompts: WeightedPromptDict;
    weightMode: WeightMode;
    pieAngles: Record<number, number>;
    circleAngles: Record<number, number>;
    circleMarker: Vec2;
    circleWeightScaling: number;
    circleExponentialScaling: boolean;
    embeddings: Embeddings;
    embedWeightScaling: number;
    embedExponentialScaling: boolean;
    embedClusters: number;
    embedPromptLimit: number;
}