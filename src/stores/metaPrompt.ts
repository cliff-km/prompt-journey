import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'metaPrompt';

export function storableMetaPrompt() {
    const store = writable("");
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || "");

    return {
        subscribe,
        update: (p: string) => {
            if (!isBrowser) return;
            localStorage[STORE_KEY] = p;
            set(p);
        },
        get: () => {
            const p = get(store);
            return p;
        },
        delete: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set("");
        },
    };
}

export const metaPrompt = storableMetaPrompt();