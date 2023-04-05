import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'preferredModelStore';

export function storablePreferredModel() {
    const store = writable("");
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || "");

    return {
        subscribe,
        updateModel: (m) => {
            if (!m || !isBrowser) return;
            localStorage[STORE_KEY] = m;
            set(m);
        },
        getModel: () => {
            const m = get(store);
            return m;
        },
        deleteModel: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set("");
        },
    };
}

export const preferredModelStore = storablePreferredModel();


export const preferredModel = derived(preferredModelStore, $preferredModelStore => get(preferredModelStore))