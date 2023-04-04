import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'preferredDirectiveStore';

export function storablePreferredDirective() {
    const store = writable("");
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || "");

    return {
        subscribe,
        updateDirectiveKey: (k) => {
            if (!k || !isBrowser) return;
            localStorage[STORE_KEY] = k;
            set(k);
        },
        getDirectiveKey: () => {
            const k = get(store);
            return k;
        },
        deleteDirectiveKey: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set("");
        },
    };
}

export const preferredDirectiveStore = storablePreferredDirective();


export const preferredDirective = derived(preferredDirectiveStore, $preferredDirectiveStore => get(preferredDirectiveStore))