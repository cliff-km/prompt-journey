import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'panelMode';

export function storablePanelMode() {
    const store = writable("select");
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || "");

    return {
        subscribe,
        update: (m: string) => {
            if (!m || !isBrowser) return;
            localStorage[STORE_KEY] = m;
            set(m);
        },
        get: () => {
            const m = get(store);
            return m;
        },
        delete: () => {
            if (!isBrowser) return;
            delete localStorage[STORE_KEY];
            set("select");
        },
    };
}

export const panelMode = storablePanelMode();