import { get, writable, derived } from 'svelte/store'

export function storableDirectiveConfigs() {
    const store = writable({});
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && Object.keys(localStorage).reduce((acc, key) => {
        if (key.startsWith('directive')) {
            const id = key.split('_')[1];
            acc[id] = JSON.parse(localStorage[key]);
        }
        return acc;
    }, {})) || {});

    return {
        subscribe,
        updateDirective: (id, p) => {
            console.log('addDirective', id, p)
            const currentStore = get(store);
            const currentDoc = currentStore[id] || {};
            const updatedDoc = { ...currentDoc, ...p };

            isBrowser && (localStorage[`directive_${id}`] = JSON.stringify(updatedDoc));

            const updatedStore = { ...currentStore, [id]: updatedDoc };
            console.log('updateDirective', id, updatedStore);
            set(updatedStore);
        },
        getDirective: (id) => {
            const currentStore = get(store);
            console.log('getDirective', id, currentStore);

            return currentStore[id];
        },
        deleteDirective: (id) => {
            isBrowser && delete localStorage[`directive_${id}`];

            const newStore = { ...get(store) };
            delete newStore[id];

            console.log('deleteDirective', id, newStore);
            set(newStore);
        },
    };
}

export const directiveStore = storableDirectiveConfigs();


export const directiveList = derived(directiveStore, $promptStore => Object.entries(get(directiveStore)))