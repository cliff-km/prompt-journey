import type { EmbeddedConcepts, VecN } from '../types';
import { get, writable } from 'svelte/store'

const STORE_KEY = 'embeddedConcepts';

export function storableConcepts() {
    const store = writable({} as EmbeddedConcepts);
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && JSON.parse(localStorage[STORE_KEY] || "{}") || {}));

    return {
        subscribe,
        update: (c: string, e: VecN | null) => {
            if (!c || !isBrowser) return;
            const concepts = get(store);
            concepts[c] = e;
            localStorage[STORE_KEY] = JSON.stringify(concepts);
            set(concepts);
        },
        get: () => {
            const concepts = get(store);
            return concepts;
        },
        delete: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set({} as EmbeddedConcepts);
        },
    };
}

export const concepts = storableConcepts();