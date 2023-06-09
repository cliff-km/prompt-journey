import { type WeightedPrompt, type WeightedPromptDict, type MultiPrompt, WeightMode } from '../types';
import { get, writable, derived } from 'svelte/store'
import { selectedPrompt } from './selectedPrompt';
import { promptStore } from './prompt';

const STORE_KEY = 'activePrompt';

export function createWeightedPrompt(id: number, text: string, parsedWeight: number, barWeight = 1) : WeightedPrompt {
    return {
        id,
        text,
        barWeight,
        parsedWeight,
        randomWeight: Math.random(),
    }
}

export function defaultPrompt() : WeightedPromptDict {
    return {
        0: createWeightedPrompt(0, "Magic potion in a mystical bottle", 1),
        1: createWeightedPrompt(1, "A crystalline decanter", 1),
        2: createWeightedPrompt(2, "An ornate tequila bottle", 1),
        3: createWeightedPrompt(3, "An antique sake bottle", 1),
        4: createWeightedPrompt(4, "A colorful perfume bottle", 1),
        5: createWeightedPrompt(5, "A glass vase full of vibrant flowers", 1),
        6: createWeightedPrompt(6, "A minimalist glass tea kettle", 1),
        7: createWeightedPrompt(7, "Chihuly glass art", 1),
        8: createWeightedPrompt(8, "A fine wine bottle", 1),
        9: createWeightedPrompt(9, "A gourmet vinegar bottle", 1),
        10: createWeightedPrompt(10, "A stunning fishbowl", 1),
        11: createWeightedPrompt(11, "A striking piece of tourmaline", 1),
        12: createWeightedPrompt(12, "A finely cut piece of sapphire", 1),
        13: createWeightedPrompt(13, "Iittala glass art", 1),
    }
}

export function intializeActivePrompt(prompts: WeightedPromptDict, promptLimit: number, weightMode = WeightMode.Random) : MultiPrompt {
    return ({
        weightedPrompts: prompts || {},
        weightMode,
        pieAngles: {},
        ringAngles: {},
        ringStartAngle: 0,
        ringReverse: false,
        ringWeightScaling: 2,
        ringExponentialScaling: true,
        circleAngles: {},
        circleMarker: [270, 0.33],
        circleWeightScaling: 2,
        circleExponentialScaling: true,
        embedWeightScaling: 2,
        embedExponentialScaling: true,
        embedClusters: 0,
        promptLimit: promptLimit > Object.keys(prompts).length ? Object.keys(prompts).length : promptLimit,
    })
}

export function storableActivePrompt() {
    const store = writable({} as MultiPrompt);
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    const savedActivePrompt = (isBrowser && localStorage[STORE_KEY]) ? JSON.parse(localStorage[STORE_KEY]) : intializeActivePrompt(defaultPrompt(), 30);

    set({...intializeActivePrompt({}, 30), ...savedActivePrompt});

    return {
        subscribe,
        update: (p: MultiPrompt) => {
            const activePromptId = selectedPrompt.get();
            if(activePromptId) {
                promptStore.update(activePromptId, p);
            }

            if (!p || !isBrowser) return;
            localStorage[STORE_KEY] = JSON.stringify(p);
            set({...intializeActivePrompt({}, 30), ...p});
        },
        get: () => {
            const p = get(store);
            return p;
        },
        delete: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set(intializeActivePrompt(defaultPrompt(), 30));
        },
    };
}

export const activePrompt = storableActivePrompt();