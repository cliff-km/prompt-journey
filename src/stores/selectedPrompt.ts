import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'selectedPrompt';

export function storableSelectedPrompt() {
    const store = writable("");
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || "");

    return {
        subscribe,
        update: (id: string) => {
            if (!id || !isBrowser) return;
            localStorage[STORE_KEY] = id;
            set(id);
        },
        get: () => {
            const id = get(store);
            return id;
        },
        delete: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set("");
        },
    };
}

export const selectedPrompt = storableSelectedPrompt();
