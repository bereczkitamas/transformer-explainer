import { writable } from 'svelte/store';
import type { LayerLogitLens, LatentTrajectoryPoint } from './types';

export const logitLensState = writable<LayerLogitLens[]>([]);
export const trajectoryState = writable<LatentTrajectoryPoint[]>([]);

export * from './types';
export * from './logitLens';
export * from './trajectoryCalculator';
