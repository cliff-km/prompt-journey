import type { Concepts, EmbeddedConcepts, VecN } from '../types';
import { derived, get, writable } from 'svelte/store'
import { activePrompt } from './activePrompt';

const STORE_KEY = 'concept';
export function storableConcepts() {
    const store = writable({} as Concepts);
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && Object.keys(localStorage).reduce((acc, key) => {
        if (key.startsWith(STORE_KEY + '_')) {
            const id = key.split(/_(.*)/s)[1];
            acc[id] = JSON.parse(localStorage[key]) as VecN;
        }
        return acc;
    }, {} as Concepts)) || {});

    return {
        subscribe,
        update: (c: string, e: VecN) => {
            if (!c || !isBrowser) return;
            const concepts = get(store);
            concepts[c] = e;
            set(concepts);
        },
        cache: (n: number) => {
            if (!isBrowser) return;
            const concepts = get(store);
            const activeConcepts = Object.values(activePrompt.get().weightedPrompts).map(p => p.text);
            Object.entries(concepts)
            .sort(([id1, data1], [id2, data2]) => {
                if (activeConcepts.includes(id1) && !activeConcepts.includes(id2)) return -1;
                if (!activeConcepts.includes(id1) && activeConcepts.includes(id2)) return 1;
                return 0;
            })
            .forEach(([id, data], idx) => {
                if (idx <= n) {
                    localStorage[`concept_${id}`] = JSON.stringify(data);
                } else {
                    delete localStorage[`concept_${id}`];
                }
            });
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
            set({} as Concepts);
        },
    };
}

export const concepts = storableConcepts();

export const embeddedConcepts = derived(concepts, $concepts => {
    return Object.entries($concepts).reduce((acc, [id, data]) => {
        if (!data) return acc;
        acc[id] = data;
        return acc;
    }, {} as EmbeddedConcepts);
});