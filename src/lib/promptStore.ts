import { get, writable, derived } from 'svelte/store'

export function storablePromptConfigs() {
    const store = writable({});
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && Object.keys(localStorage).reduce((acc, key) => {
        if (key.startsWith('prompt')) {
            const id = key.split('_')[1];
            acc[id] = JSON.parse(localStorage[key]);
        }
        return acc;
    }, {})) || {});

    return {
        subscribe,
        updatePrompt: (id, p) => {
            console.log('addPrompt', id, p)
            const currentStore = get(store);
            const currentDoc = currentStore[id] || {};
            const updatedDoc = { ...currentDoc, ...p };

            isBrowser && (localStorage[`prompt_${id}`] = JSON.stringify(updatedDoc));

            const updatedStore = { ...currentStore, [id]: updatedDoc };
            console.log('updatePrompt', id, updatedStore);
            set(updatedStore);
        },
        getPrompt: (id) => {
            const currentStore = get(store);
            console.log('getPrompt', id, currentStore);

            return currentStore[id];
        },
        deletePrompt: (id) => {
            isBrowser && delete localStorage[`prompt_${id}`];

            const newStore = { ...get(store) };
            delete newStore[id];

            console.log('deletePrompt', id, newStore);
            set(newStore);
        },
    };
}

export const promptStore = storablePromptConfigs();


export const promptList = derived(promptStore, $promptStore => Object.entries(get(promptStore)))