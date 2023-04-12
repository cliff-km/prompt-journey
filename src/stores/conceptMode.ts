import { writable } from 'svelte/store';
import { ConceptMode } from '../types';

export const conceptMode = writable(ConceptMode.List);