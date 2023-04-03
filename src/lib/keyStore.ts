import { get, writable, derived } from 'svelte/store'

const STORE_KEY = 'oKeyStore';

export function storableKey() {
   const store = writable("");
   const { subscribe, set, update } = store;
   const isBrowser = typeof window !== 'undefined';

   set((isBrowser && localStorage[STORE_KEY]) || "");

   return {
      subscribe,
      updateKey: (k) => {
        if(!k || !isBrowser) return;
        localStorage[STORE_KEY] = k;
        set(k);
      },
      getKey: () => {
         const k = get(store);
         return k;
      },
      deleteKey: () => {
        if(!isBrowser) return;
        delete localStorage[STORE_KEY];
        set("");
      },
   };
}

export const keyStore = storableKey();


export const key = derived(keyStore, $keyStore => get(keyStore))