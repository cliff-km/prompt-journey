import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'preferredEmbeddingModelStore';

export function storablePreferredEmbeddingModel() {
    const store = writable("");
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || "");

    return {
        subscribe,
        updateEmbeddingModel: (m) => {
            if (!m || !isBrowser) return;
            localStorage[STORE_KEY] = m;
            set(m);
        },
        getEmbeddingModel: () => {
            const m = get(store);
            return m;
        },
        deleteEmbeddingModel: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set("");
        },
    };
}

export const preferredEmbeddingModelStore = storablePreferredEmbeddingModel();


export const preferredEmbeddingModel = derived(preferredEmbeddingModelStore, $preferredEmbeddingModelStore => get(preferredEmbeddingModelStore))