import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'metaPromptStore';

export function storableMetaPrompt() {
    const store = writable("");
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || "");

    return {
        subscribe,
        updateMetaPrompt: (p) => {
            if (!p || !isBrowser) return;
            localStorage[STORE_KEY] = p;
            set(p);
        },
        getMetaPrompt: () => {
            const p = get(store);
            return p;
        },
        deleteMetaPrompt: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set("");
        },
    };
}

export const metaPromptStore = storableMetaPrompt();


export const metaPrompt = derived(metaPromptStore, $metaPromptStore => get(metaPromptStore))