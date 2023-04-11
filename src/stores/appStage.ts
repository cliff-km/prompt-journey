import { AppStage } from '../types';
import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'appState';

export function storableAppStage() {
    const store = writable(AppStage.Build);
    const { subscribe, set, update } = store;
    const isBrowser = typeof window !== 'undefined';

    set((isBrowser && localStorage[STORE_KEY]) || AppStage.Build);

    return {
        subscribe,
        update: (m: AppStage) => {
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
            set(AppStage.Build);
        },
    };
}

export const appStageStore = storableAppStage();

export const appStage = derived(appStageStore, $appStageStore => get(appStageStore))