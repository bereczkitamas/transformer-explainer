export type AbstractionLevel = 'layman' | 'visual' | 'engineering';

export interface AnalogyCard {
	id: string;
	title: string;
	category: 'attention' | 'position' | 'mlp' | 'temperature' | 'moe';
	storyMetaphor: string;
	interactiveGuide: string;
}
