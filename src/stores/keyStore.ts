import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'oKeyStore';

export function storableKey() {
    const store = writable("");
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || "");

    return {
        subscribe,
        update: (k) => {
            if (!k || !isBrowser) return;
            localStorage[STORE_KEY] = k;
            set(k);
        },
        get: () => {
            const k = get(store);
            return k;
        },
        delete: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set("");
        },
    };
}

export const keyStore = storableKey();


export const key = derived(keyStore, $keyStore => get(keyStore))