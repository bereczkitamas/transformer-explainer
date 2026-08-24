export interface GenerationStep {
	stepIndex: number;
	tokenId: number;
	tokenText: string;
	probability: number;
	logits: number[];
	timestamp: number;
}

export interface AutoregressiveState {
	isPlaying: boolean;
	isPaused: boolean;
	currentStep: number;
	maxTokens: number;
	generationDelayMs: number;
	history: GenerationStep[];
}
