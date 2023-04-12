import type { EmbeddedConcepts, VecN } from '../types';
import { get, writable } from 'svelte/store'

const STORE_KEY = 'concept';
export function storableConcepts() {
    const store = writable({} as EmbeddedConcepts);
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && Object.keys(localStorage).reduce((acc, key) => {
        if (key.startsWith(STORE_KEY + '_')) {
            const id = key.split(/_(.*)/s)[1];
            acc[id] = JSON.parse(localStorage[key]) as VecN | null;
        }
        return acc;
    }, {} as EmbeddedConcepts)) || {});

    return {
        subscribe,
        update: (c: string, e: VecN | null) => {
            if (!c || !isBrowser) return;
            const concepts = get(store);
            concepts[c] = e;
            localStorage[`concept_${c}`] = JSON.stringify(e);
            set(concepts);
        },
        get: () => {
            const concepts = get(store);
            return concepts;
        },
        remove: (c: string) => {
            if (!c || !isBrowser) return;
            const concepts = get(store);
            delete concepts[c];
            delete localStorage[`concept_${c}`];
            set(concepts);
        },
        delete: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set({} as EmbeddedConcepts);
        },
    };
}

export const concepts = storableConcepts();