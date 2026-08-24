export interface KVCacheLayerState {
	layerIdx: number;
	keys: number[][][];
	values: number[][][];
	cachedLength: number;
	maxCapacity: number;
}

export interface KVCacheState {
	enabled: boolean;
	layers: KVCacheLayerState[];
	totalSavedOps: number;
	memoryUsageBytes: number;
}
