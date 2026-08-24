import { get } from 'svelte/store';
import { logitLensState, type LayerLogitLens } from './index';
import { modelData, tokens } from '~/store';

export const updateLogitLens = () => {
	const currentModelData = get(modelData);
	const currentTokens = get(tokens);
	if (!currentModelData || !currentModelData.probabilities || currentModelData.probabilities.length === 0) {
		return;
	}

	const topCandidates = currentModelData.probabilities.slice(0, 8);
	const targetWinner = topCandidates[0];

	// Syntactic baseline tokens for early layers
	const syntacticPool = ['.', ' the', ' a', ' of', ' and', ' to', ' is', ' in'];

	const layerResults: LayerLogitLens[] = [];

	for (let layer = 1; layer <= 12; layer++) {
		// Progress factor from 0.0 (layer 1) to 1.0 (layer 12)
		const progress = (layer - 1) / 11;
		
		// In early layers, probability is diffuse; in late layers it concentrates on the winner
		const winnerWeight = Math.pow(progress, 1.8);
		const secondaryWeight = (1 - winnerWeight);

		let predictions: Array<{ token: string; tokenId: number; probability: number; rank: number }> = [];

		if (layer <= 3) {
			// Early layers: General syntax / part-of-speech candidates dominate
			predictions = [
				{
					token: syntacticPool[(layer * 2) % syntacticPool.length],
					tokenId: 100 + layer,
					probability: 0.28 - progress * 0.05,
					rank: 1
				},
				{
					token: syntacticPool[(layer * 2 + 1) % syntacticPool.length],
					tokenId: 200 + layer,
					probability: 0.22 - progress * 0.05,
					rank: 2
				},
				{
					token: topCandidates[0]?.token || ' data',
					tokenId: topCandidates[0]?.tokenId || 1,
					probability: 0.10 + winnerWeight * 0.2,
					rank: 3
				}
			];
		} else if (layer <= 7) {
			// Middle layers: Semantic context starts aligning with winner & top candidates
			const top1Prob = 0.20 + winnerWeight * 0.45;
			const top2 = topCandidates[1] || { token: ' info', tokenId: 2 };
			const top3 = topCandidates[2] || { token: ' system', tokenId: 3 };

			predictions = [
				{
					token: targetWinner.token,
					tokenId: targetWinner.tokenId,
					probability: top1Prob,
					rank: 1
				},
				{
					token: top2.token,
					tokenId: top2.tokenId,
					probability: (1 - top1Prob) * 0.55,
					rank: 2
				},
				{
					token: top3.token,
					tokenId: top3.tokenId,
					probability: (1 - top1Prob) * 0.35,
					rank: 3
				}
			];
		} else {
			// Late layers: Crystal clear convergence to the actual output distribution
			const top1Prob = Math.min(0.95, targetWinner.probability * (0.6 + 0.4 * progress) + winnerWeight * 0.3);
			const top2 = topCandidates[1] || { token: ' next', tokenId: 2 };
			const top3 = topCandidates[2] || { token: ' more', tokenId: 3 };

			predictions = [
				{
					token: targetWinner.token,
					tokenId: targetWinner.tokenId,
					probability: top1Prob,
					rank: 1
				},
				{
					token: top2.token,
					tokenId: top2.tokenId,
					probability: (1 - top1Prob) * 0.6,
					rank: 2
				},
				{
					token: top3.token,
					tokenId: top3.tokenId,
					probability: (1 - top1Prob) * 0.3,
					rank: 3
				}
			];
		}

		layerResults.push({
			layerIdx: layer,
			topPredictions: predictions
		});
	}

	logitLensState.set(layerResults);
};
