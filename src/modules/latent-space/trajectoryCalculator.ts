import { get } from 'svelte/store';
import { trajectoryState, type LatentTrajectoryPoint } from './index';
import { tokens, predictedToken } from '~/store';

export const updateLatentTrajectory = () => {
	const currentTokens = get(tokens);
	const pred = get(predictedToken);
	const tokenCount = currentTokens?.length || 1;

	// Deterministic pseudo-random angle based on current prompt
	const seed = (pred?.tokenId || 42) % 360;
	const rad = (seed * Math.PI) / 180;

	const points: LatentTrajectoryPoint[] = [];

	// Initial cluster center in 2D (e.g., [120, 300])
	const startX = 80;
	const startY = 280;

	// Target basin (e.g., [520, 100])
	const targetX = 500 + Math.cos(rad) * 60;
	const targetY = 90 + Math.sin(rad) * 50;

	for (let layer = 1; layer <= 12; layer++) {
		const t = (layer - 1) / 11;
		
		// S-curve trajectory with non-linear acceleration
		const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

		// Add subtle harmonic curvature to represent attention routing
		const curveX = Math.sin(t * Math.PI) * 40 * Math.cos(rad * 2);
		const curveY = Math.sin(t * Math.PI) * 50 * Math.sin(rad * 2);

		const x = startX + (targetX - startX) * easeT + curveX;
		const y = startY + (targetY - startY) * easeT + curveY;

		let clusterLabel = '';
		if (layer <= 3) clusterLabel = 'L1-L3: Szintaxis & Nyelvtani formák';
		else if (layer <= 6) clusterLabel = 'L4-L6: Kontextuális Figyelem (QKV)';
		else if (layer <= 9) clusterLabel = 'L7-L9: Szemantikai Konvergencia';
		else clusterLabel = 'L10-L12: Végső Logit Választás';

		points.push({
			layerIdx: layer,
			tokenIndex: tokenCount - 1,
			vector2D: [Math.round(x), Math.round(y)],
			vector3D: [Math.round(x), Math.round(y), layer * 20],
			clusterLabel
		});
	}

	trajectoryState.set(points);
};
