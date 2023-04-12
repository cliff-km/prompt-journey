import { get, writable, derived } from 'svelte/store';

export function storablePromptConfigs() {
    const store = writable({});
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && Object.keys(localStorage).reduce((acc, key) => {
        if (key.startsWith('prompt_')) {
            const id = key.split('_')[1];
            acc[id] = JSON.parse(localStorage[key]);
        }
        return acc;
    }, {})) || {});

    return {
        subscribe,
        update: (id, p) => {
            const currentStore = get(store);
            const currentDoc = currentStore[id] || {};
            const updatedDoc = { ...currentDoc, ...p };

            isBrowser && (localStorage[`prompt_${id}`] = JSON.stringify(updatedDoc));

            const updatedStore = { ...currentStore, [id]: updatedDoc };
            set(updatedStore);
        },
        get: (id) => {
            const currentStore = get(store);

            return currentStore[id];
        },
        delete: (id) => {
            isBrowser && delete localStorage[`prompt_${id}`];

            const newStore = { ...get(store) };
            delete newStore[id];

            set(newStore);
        },
    };
}

export const promptStore = storablePromptConfigs();

export const promptList = derived(promptStore, $promptStore => Object.entries(get(promptStore)))