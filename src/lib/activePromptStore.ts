import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'activePromptStore';

export function defaultPrompt() {
    return {
        0: {
            id: 0,
            text: "Prompt 1",
            parsedWeight: 1,
        },
        1: {
            id: 1,
            text: "Prompt 2",
            parsedWeight: 1,
        },
        2: {
            id: 2,
            text: "Prompt 3",
            parsedWeight: 1,
        },
    }
}

export function intializeActivePrompt(prompts) {
    return ({
        weightedPrompts: prompts || {},
        weightMode: 'circle',
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