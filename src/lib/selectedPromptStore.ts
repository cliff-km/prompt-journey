import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'selectedPromptStore';

export function storableSelectedPrompt() {
    const store = writable("");
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || "");

    return {
        subscribe,
        updateId: (id: string) => {
            if (!id || !isBrowser) return;
            localStorage[STORE_KEY] = id;
            set(id);
        },
        getId: () => {
            const id = get(store);
            return id;
        },
        clearId: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set("");
        },
    };
}

export const selectedPromptStore = storableSelectedPrompt();


export const selectedPrompt = derived(selectedPromptStore, $selectedPromptStore => get(selectedPromptStore))