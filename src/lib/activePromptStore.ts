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
        0: createWeightedPrompt(0, "Prompt 1", 1),
        1: createWeightedPrompt(1, "Prompt 2", 1),
        2: createWeightedPrompt(2, "Prompt 3", 1)
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