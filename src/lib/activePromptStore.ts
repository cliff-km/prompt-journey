import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'activePromptStore';

export function createWeightedPrompt(id, text, parsedWeight, barWeight = 1) {
    return {
        id,
        text,
        barWeight,
        parsedWeight,
    }
}

export function defaultPrompt() {
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

export function intializeActivePrompt(prompts, weightMode = 'circle') {
    return ({
        weightedPrompts: prompts || {},
        weightMode,
        circleAngles: {},
        circleMarker: [0, 0],
        circleWeightScaling: 2,
        circleExponentialScaling: true
    })
}

export function storableActivePrompt() {
    const store = writable({});
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) ? JSON.parse(localStorage[STORE_KEY]) : intializeActivePrompt(defaultPrompt()));

    return {
        subscribe,
        updateActivePrompt: (p: object) => {
            if (!p || !isBrowser) return;
            localStorage[STORE_KEY] = JSON.stringify(p);
            set(p);
        },
        getActivePrompt: () => {
            const p = get(store);
            return p;
        },
        deleteActivePrompt: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set(intializeActivePrompt(defaultPrompt()));
        },
    };
}

export const activePromptStore = storableActivePrompt();


export const activePrompt = derived(activePromptStore, $activePromptStore => get(activePromptStore))