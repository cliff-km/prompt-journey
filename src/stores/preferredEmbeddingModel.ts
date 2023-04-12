import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'preferredEmbeddingModel';

export function storablePreferredEmbeddingModel() {
    const store = writable("");
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || "");

    return {
        subscribe,
        update: (m: string) => {
            if (!m || !isBrowser) return;
            localStorage[STORE_KEY] = m;
            set(m);
        },
        get: () => {
            const m = get(store);
            return m;
        },
        delete: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set("");
        },
    };
}

export const preferredEmbeddingModel = storablePreferredEmbeddingModel();
