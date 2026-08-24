import { writable } from 'svelte/store';
import type { SupportedLLMArchitecture, ArchitectureSpec } from './types';

export const ARCHITECTURE_SPECS: Record<SupportedLLMArchitecture, ArchitectureSpec> = {
	gpt2: {
		id: 'gpt2',
		name: 'GPT-2 / GPT-3',
		family: 'OpenAI GPT',
		positionalEncoding: 'learned',
		attentionType: 'mha',
		mlpType: 'gelu',
		normalization: 'layernorm',
		maxContextTokens: 1024,
		multimodalNative: false
	},
	llama3: {
		id: 'llama3',
		name: 'Llama 3 / Mistral',
		family: 'Meta / Mistral',
		positionalEncoding: 'rope',
		attentionType: 'gqa',
		mlpType: 'swiglu',
		normalization: 'rmsnorm',
		maxContextTokens: 128000,
		multimodalNative: false
	},
	gemini: {
		id: 'gemini',
		name: 'Gemini / Gemma 2',
		family: 'Google DeepMind',
		positionalEncoding: 'rope',
		attentionType: 'gqa',
		mlpType: 'geglu',
		normalization: 'dual_rmsnorm',
		maxContextTokens: 1000000,
		multimodalNative: true
	},
	'mixtral-moe': {
		id: 'mixtral-moe',
		name: 'Mixtral 8x7B (Sparse MoE)',
		family: 'Mistral / DeepSeek',
		positionalEncoding: 'rope',
		attentionType: 'gqa',
		mlpType: 'sparse_moe',
		normalization: 'rmsnorm',
		maxContextTokens: 32000,
		expertCount: 8,
		activeExpertsPerToken: 2,
		multimodalNative: false
	}
};

export const activeArchitecture = writable<SupportedLLMArchitecture>('gpt2');

export * from './types';
