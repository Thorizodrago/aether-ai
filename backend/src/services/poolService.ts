import { getPoolQuote, getAssetInfo } from '../libs/tinymanClient';

export interface PoolRecommendation {
	poolId: string;
	assetA: {
		id: number;
		name: string;
		unitName: string;
		decimals: number;
	};
	assetB: {
		id: number;
		name: string;
		unitName: string;
		decimals: number;
	};
	liquidity: {
		total: number;
		assetA: number;
		assetB: number;
	};
	volume24h: number;
	apr: number;
	fees24h: number;
	riskLevel: 'Low' | 'Medium' | 'High';
	stakingOptions: {
		available: boolean;
		lockPeriod?: string;
		extraRewards?: string;
	};
	recommendation: string;
	score: number;
}

export interface PoolPreferences {
	riskTolerance: 'low' | 'medium' | 'high';
	liquidityPreference: 'high' | 'medium' | 'low';
	stakingRequired: boolean;
	preferredAssets?: string[];
}

export class PoolService {

	/**
	 * Get pool recommendations based on user preferences
	 */
	static async getPoolRecommendations(preferences: PoolPreferences): Promise<PoolRecommendation[]> {
		try {
			// Mock pool data - in production this would come from Tinyman API
			const mockPools: PoolRecommendation[] = [
				// High Liquidity Pools
				{
					poolId: 'ALGO-USDC',
					assetA: { id: 0, name: 'Algorand', unitName: 'ALGO', decimals: 6 },
					assetB: { id: 31566704, name: 'USD Coin', unitName: 'USDC', decimals: 6 },
					liquidity: { total: 15000000, assetA: 5000000, assetB: 10000000 },
					volume24h: 2500000,
					apr: 8.5,
					fees24h: 7500,
					riskLevel: 'Low',
					stakingOptions: { available: true, lockPeriod: '30 days', extraRewards: 'ALGO rewards' },
					recommendation: 'Stable pair with consistent returns and high liquidity',
					score: 9.2
				},
				{
					poolId: 'ALGO-USDT',
					assetA: { id: 0, name: 'Algorand', unitName: 'ALGO', decimals: 6 },
					assetB: { id: 312769, name: 'Tether USDt', unitName: 'USDt', decimals: 6 },
					liquidity: { total: 8000000, assetA: 3000000, assetB: 5000000 },
					volume24h: 1200000,
					apr: 7.2,
					fees24h: 3600,
					riskLevel: 'Low',
					stakingOptions: { available: true, lockPeriod: '14 days' },
					recommendation: 'Safe stablecoin pair with decent yields',
					score: 8.7
				},
				// Medium Risk Pools
				{
					poolId: 'ALGO-AKTA',
					assetA: { id: 0, name: 'Algorand', unitName: 'ALGO', decimals: 6 },
					assetB: { id: 523683256, name: 'Akita Inu Token', unitName: 'AKTA', decimals: 0 },
					liquidity: { total: 3500000, assetA: 1500000, assetB: 2000000 },
					volume24h: 800000,
					apr: 15.3,
					fees24h: 2400,
					riskLevel: 'Medium',
					stakingOptions: { available: true, lockPeriod: '7 days', extraRewards: 'AKTA staking rewards' },
					recommendation: 'Popular community token with higher rewards',
					score: 8.1
				},
				{
					poolId: 'ALGO-GARD',
					assetA: { id: 0, name: 'Algorand', unitName: 'ALGO', decimals: 6 },
					assetB: { id: 684649988, name: 'Gardenia Token', unitName: 'GARD', decimals: 6 },
					liquidity: { total: 2200000, assetA: 900000, assetB: 1300000 },
					volume24h: 450000,
					apr: 18.7,
					fees24h: 1350,
					riskLevel: 'Medium',
					stakingOptions: { available: false },
					recommendation: 'Growing ecosystem token with good potential',
					score: 7.8
				},
				// High Risk Pools  
				{
					poolId: 'ALGO-DEFLY',
					assetA: { id: 0, name: 'Algorand', unitName: 'ALGO', decimals: 6 },
					assetB: { id: 470842789, name: 'Defly Token', unitName: 'DEFLY', decimals: 6 },
					liquidity: { total: 1800000, assetA: 700000, assetB: 1100000 },
					volume24h: 320000,
					apr: 25.4,
					fees24h: 960,
					riskLevel: 'High',
					stakingOptions: { available: true, lockPeriod: '90 days', extraRewards: 'DEFLY governance rewards' },
					recommendation: 'High-yield DeFi token with governance utility',
					score: 7.2
				},
				{
					poolId: 'ALGO-TINY',
					assetA: { id: 0, name: 'Algorand', unitName: 'ALGO', decimals: 6 },
					assetB: { id: 465865291, name: 'Tinyman Token', unitName: 'TINY', decimals: 6 },
					liquidity: { total: 1200000, assetA: 500000, assetB: 700000 },
					volume24h: 180000,
					apr: 32.1,
					fees24h: 540,
					riskLevel: 'High',
					stakingOptions: { available: true, lockPeriod: '60 days', extraRewards: 'TINY token rewards' },
					recommendation: 'Platform token with high rewards but higher risk',
					score: 6.8
				}
			];

			// Filter pools based on preferences
			let filteredPools = mockPools.filter(pool => {
				// Risk tolerance filter
				if (preferences.riskTolerance === 'low' && pool.riskLevel !== 'Low') return false;
				if (preferences.riskTolerance === 'medium' && pool.riskLevel === 'High') return false;

				// Liquidity preference filter
				if (preferences.liquidityPreference === 'high' && pool.liquidity.total < 5000000) return false;
				if (preferences.liquidityPreference === 'medium' && pool.liquidity.total < 1000000) return false;

				// Staking requirement filter
				if (preferences.stakingRequired && !pool.stakingOptions.available) return false;

				// Preferred assets filter (if specified)
				if (preferences.preferredAssets && preferences.preferredAssets.length > 0) {
					const hasPreferredAsset = preferences.preferredAssets.some(asset =>
						pool.assetA.unitName.toLowerCase().includes(asset.toLowerCase()) ||
						pool.assetB.unitName.toLowerCase().includes(asset.toLowerCase())
					);
					if (!hasPreferredAsset) return false;
				}

				return true;
			});

			// Sort by score (highest first)
			filteredPools.sort((a, b) => b.score - a.score);

			// Limit to top 3 recommendations
			return filteredPools.slice(0, 3);

		} catch (error) {
			console.error('Error getting pool recommendations:', error);
			throw new Error('Failed to get pool recommendations');
		}
	}

	/**
	 * Get detailed pool information
	 */
	static async getPoolDetails(poolId: string): Promise<PoolRecommendation | null> {
		try {
			const pools = await this.getPoolRecommendations({
				riskTolerance: 'high', // Get all pools
				liquidityPreference: 'low',
				stakingRequired: false
			});

			return pools.find(pool => pool.poolId === poolId) || null;
		} catch (error) {
			console.error('Error getting pool details:', error);
			return null;
		}
	}

	/**
	 * Generate pool recommendation text based on preferences
	 */
	static async generateRecommendationText(preferences: PoolPreferences): Promise<string> {
		try {
			const recommendations = await this.getPoolRecommendations(preferences);

			if (recommendations.length === 0) {
				return `**🏊‍♂️ Pool Recommendations**\n\n❌ No pools found matching your preferences.\n\nTry adjusting your criteria:\n• Lower risk tolerance\n• Reduce liquidity requirements\n• Remove staking requirement`;
			}

			let text = `**🏊‍♂️ Personalized Pool Recommendations**\n\n`;
			text += `**Your Preferences:**\n`;
			text += `• Risk Tolerance: ${preferences.riskTolerance.charAt(0).toUpperCase() + preferences.riskTolerance.slice(1)}\n`;
			text += `• Liquidity: ${preferences.liquidityPreference.charAt(0).toUpperCase() + preferences.liquidityPreference.slice(1)} preference\n`;
			text += `• Staking: ${preferences.stakingRequired ? 'Required' : 'Optional'}\n\n`;

			recommendations.forEach((pool, index) => {
				text += `**${index + 1}. ${pool.poolId} Pool** ⭐ ${pool.score}/10\n`;
				text += `💧 **Liquidity:** $${(pool.liquidity.total / 1000000).toFixed(1)}M\n`;
				text += `📈 **APR:** ${pool.apr}% | **24h Volume:** $${(pool.volume24h / 1000000).toFixed(1)}M\n`;
				text += `⚠️ **Risk:** ${pool.riskLevel}\n`;

				if (pool.stakingOptions.available) {
					text += `🔒 **Staking:** Available (${pool.stakingOptions.lockPeriod})`;
					if (pool.stakingOptions.extraRewards) {
						text += ` + ${pool.stakingOptions.extraRewards}`;
					}
					text += `\n`;
				}

				text += `💡 **Why:** ${pool.recommendation}\n\n`;
			});

			text += `*Ready to invest? Say "Pool: [pool name]" to get started or "Swap: [amount] [token]" to trade.*`;

			return text;
		} catch (error) {
			console.error('Error generating recommendation text:', error);
			return '❌ Unable to generate pool recommendations. Please try again.';
		}
	}

	/**
	 * Parse user preference input
	 */
	static parsePreferences(input: string): PoolPreferences {
		const lowerInput = input.toLowerCase();

		// Default preferences
		const preferences: PoolPreferences = {
			riskTolerance: 'medium',
			liquidityPreference: 'medium',
			stakingRequired: false,
			preferredAssets: []
		};

		// Parse risk tolerance
		if (lowerInput.includes('low risk') || lowerInput.includes('safe') || lowerInput.includes('conservative')) {
			preferences.riskTolerance = 'low';
		} else if (lowerInput.includes('high risk') || lowerInput.includes('risky') || lowerInput.includes('aggressive')) {
			preferences.riskTolerance = 'high';
		}

		// Parse liquidity preference
		if (lowerInput.includes('high liquidity') || lowerInput.includes('large pool')) {
			preferences.liquidityPreference = 'high';
		} else if (lowerInput.includes('low liquidity') || lowerInput.includes('small pool')) {
			preferences.liquidityPreference = 'low';
		}

		// Parse staking requirement
		if (lowerInput.includes('staking') || lowerInput.includes('stake') || lowerInput.includes('lock')) {
			preferences.stakingRequired = true;
		}

		// Parse preferred assets
		const assets = ['algo', 'usdc', 'usdt', 'akta', 'defly', 'tiny', 'gard'];
		preferences.preferredAssets = assets.filter(asset => lowerInput.includes(asset));

		return preferences;
	}
}
