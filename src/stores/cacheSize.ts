import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'cacheSize';

export function storableCacheSize() {
    const store = writable(50);
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) ? parseInt(localStorage[STORE_KEY]) : 50);

    return {
        subscribe,
        update: (n: number) => {
            if (!isBrowser) return;
            localStorage[STORE_KEY] = JSON.stringify(n);
            set(n);
        },
        get: () => {
            const m = get(store);
            return m;
        },
        delete: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set(50);
        },
    };
}

export const cacheSize = storableCacheSize();
