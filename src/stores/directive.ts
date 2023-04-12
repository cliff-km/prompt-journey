import type { Directive, DirectiveDict } from '../types';
import { get, writable, derived } from 'svelte/store'

export function storableDirectiveConfigs() {
    const store = writable({} as DirectiveDict);
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && Object.keys(localStorage).reduce((acc, key) => {
        if (key.startsWith('directive')) {
            const id = key.split('_')[1];
            acc[id] = JSON.parse(localStorage[key]) as Directive;
        }
        return acc;
    }, {} as DirectiveDict)) || {});

    return {
        subscribe,
        update: (id: string, p: Directive) => {
            const currentStore = get(store);
            const currentDoc = currentStore[id] || {};
            const updatedDoc = { ...currentDoc, ...p };

            isBrowser && (localStorage[`directive_${id}`] = JSON.stringify(updatedDoc));

            const updatedStore = { ...currentStore, [id]: updatedDoc };
            set(updatedStore);
        },
        get: (id: string) => {
            const currentStore = get(store);

            return currentStore[id];
        },
        delete: (id: string) => {
            isBrowser && delete localStorage[`directive_${id}`];

            const newStore = { ...get(store) };
            delete newStore[id];

            set(newStore);
        },
    };
}

export const directiveStore = storableDirectiveConfigs();


export const directiveList = derived(directiveStore, $directiveStore => Object.entries(get(directiveStore)))