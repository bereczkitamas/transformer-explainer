export type SupportedLLMArchitecture = 'gpt2' | 'llama3' | 'gemini' | 'mixtral-moe';

export interface ArchitectureSpec {
	id: SupportedLLMArchitecture;
	name: string;
	family: string;
	positionalEncoding: 'learned' | 'sinusoidal' | 'rope' | 'alibi';
	attentionType: 'mha' | 'gqa' | 'mqa' | 'sliding_window';
	mlpType: 'gelu' | 'swiglu' | 'geglu' | 'sparse_moe';
	normalization: 'layernorm' | 'rmsnorm' | 'dual_rmsnorm';
	maxContextTokens: number;
	expertCount?: number;
	activeExpertsPerToken?: number;
	multimodalNative: boolean;
}
