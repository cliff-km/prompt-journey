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
    randomWeight?: number;
}

export type WeightedPromptDict = Record<number, WeightedPrompt>;

export enum WeightMode {
    Circle = "circle",
    Ring = "ring",
    Bars = "bars",
    Embed = "embed",
    EmbedGrid = "embedGrid",
    EmbedRandom = "embedRandom",
    Pie = "pie",
    Random = "random",
}

export enum AppStage {
    Build = "build",
    Concept = "concept",
    History = "history",
}

export enum ConceptMode {
    List = "list",
    Map = "map"
}

export type Embeddings = Record<number, VecN>;

export type SlotSet = {
    name: string;
    values: string[];
}

export type Concepts = Record<string, VecN>;
export type EmbeddedConcepts = Record<string, VecN>;

export type PromptHistory = PromptEvent[];

export type PromptEvent = {
    id: string;
    date: Date;
    prompt: string;
}

export type SlotSetDict = Record<string, SlotSet>;

export type MultiPrompt = {
    weightedPrompts: WeightedPromptDict;
    weightMode: WeightMode;
    pieAngles: Record<number, number>;
    ringAngles: Record<number, number>;
    ringStartAngle: number;
    ringReverse: boolean;
    ringWeightScaling: number;
    ringExponentialScaling: boolean;
    circleAngles: Record<number, number>;
    circleMarker: Vec2;
    circleWeightScaling: number;
    circleExponentialScaling: boolean;
    embedMarker?: Vec2;
    embedClusterSets?: Record<number, number[][]>;
    embedWeightScaling: number;
    embedExponentialScaling: boolean;
    embedClusters: number;
    promptLimit: number;
    scaledEmbedMappings?: Record<number, Vec2>;
    promptLimit: number;
}

export type PointData = {
    xy: Vec2;
    text: string;
    connected: boolean;
    opacity: number;
};