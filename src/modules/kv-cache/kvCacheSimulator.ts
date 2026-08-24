import { get } from 'svelte/store';
import { kvCacheState, type KVCacheLayerState } from './index';

const NUM_LAYERS = 12;
const NUM_HEADS = 12;
const HEAD_DIM = 64;
const BYTES_PER_FLOAT32 = 4;

export const updateKVCacheOnStep = (currentSeqLen: number, promptLength: number) => {
	const totalTokens = currentSeqLen;

	const bytesPerTokenPerLayer = 2 * NUM_HEADS * HEAD_DIM * BYTES_PER_FLOAT32;
	const totalMemoryBytes = totalTokens * NUM_LAYERS * bytesPerTokenPerLayer;

	const d_model = 768;
	const savedOpsThisStep = Math.max(0, (totalTokens - 1) * 2 * d_model * d_model * NUM_LAYERS);

	const layers: KVCacheLayerState[] = Array.from({ length: NUM_LAYERS }, (_, i) => ({
		layerIdx: i,
		keys: [],
		values: [],
		cachedLength: totalTokens,
		maxCapacity: 1024
	}));

	kvCacheState.update((state) => ({
		...state,
		layers,
		memoryUsageBytes: totalMemoryBytes,
		totalSavedOps: state.totalSavedOps + savedOpsThisStep
	}));
};

export const resetKVCache = () => {
	kvCacheState.set({
		enabled: true,
		layers: [],
		totalSavedOps: 0,
		memoryUsageBytes: 0
	});
};

export const formatBytes = (bytes: number): string => {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatOps = (ops: number): string => {
	if (ops >= 1e9) return (ops / 1e9).toFixed(2) + ' GFLOPs';
	if (ops >= 1e6) return (ops / 1e6).toFixed(2) + ' MFLOPs';
	if (ops >= 1e3) return (ops / 1e3).toFixed(2) + ' kFLOPs';
	return ops.toString() + ' FLOPs';
};
