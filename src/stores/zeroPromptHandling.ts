import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'zeroPromptHandlingStore';

export function storableZeroPromptHandling() {
    const store = writable(false);
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) ? JSON.parse(localStorage[STORE_KEY]) : false);

    return {
        subscribe,
        update: (b: boolean) => {
            if (!isBrowser) return;
            localStorage[STORE_KEY] = JSON.stringify(Boolean(b));
            set(Boolean(b));
        },
        get: () => {
            const m = get(store);
            return m;
        },
        delete: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set(false);
        },
    };
}

export const zeroPromptHandlingStore = storableZeroPromptHandling();


export const zeroPromptHandling = derived(zeroPromptHandlingStore, $zeroPromptHandlingStore => get(zeroPromptHandlingStore))