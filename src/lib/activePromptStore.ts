import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'activePromptStore';

export function storableActivePrompt() {
    const store = writable("");
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || "");

    return {
        subscribe,
        updateActivePrompt: (p) => {
            if (!p || !isBrowser) return;
            localStorage[STORE_KEY] = p;
            set(p);
        },
        getActivePrompt: () => {
            const p = get(store);
            return p;
        },
        deleteActivePrompt: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set("");
        },
    };
}

export const activePromptStore = storableActivePrompt();


export const activePrompt = derived(activePromptStore, $activePromptStore => get(activePromptStore))