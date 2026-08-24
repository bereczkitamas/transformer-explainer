import { writable } from 'svelte/store';
import type { AbstractionLevel } from './types';

export const currentAbstractionLevel = writable<AbstractionLevel>('visual');

export * from './types';
