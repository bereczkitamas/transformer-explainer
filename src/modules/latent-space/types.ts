export interface LayerLogitLens {
	layerIdx: number;
	topPredictions: Array<{
		token: string;
		tokenId: number;
		probability: number;
		rank: number;
	}>;
}

export interface LatentTrajectoryPoint {
	layerIdx: number;
	tokenIndex: number;
	vector2D: [number, number];
	vector3D: [number, number, number];
	clusterLabel?: string;
}
