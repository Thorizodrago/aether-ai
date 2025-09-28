import { useState } from 'react';
import './PremiumPage.css';

interface PremiumPlan {
	id: string;
	name: string;
	price: string;
	period: string;
	askLimit: string;
	agentLimit: string;
	features: string[];
	color: string;
	popular?: boolean;
}

interface PremiumPageProps {
	onBack?: () => void;
}

const PremiumPage = ({ onBack }: PremiumPageProps) => {
	const [selectedPlan, setSelectedPlan] = useState<string>('pro');

	const plans: PremiumPlan[] = [
		{
			id: 'starter',
			name: 'Starter',
			price: '$9.99',
			period: '/month',
			askLimit: '250 Ask queries',
			agentLimit: '100 Agent commands',
			features: [
				'🤖 Advanced AI responses with Web3 focus',
				'💬 Unlimited chat sessions',
				'📊 Basic wallet analytics',
				'🔗 Standard blockchain integrations',
				'📞 Community support',
				'💾 7-day chat history'
			],
			color: '#4ECDC4'
		},
		{
			id: 'professional',
			name: 'Professional',
			price: '$24.99',
			period: '/month',
			askLimit: '1,000 Ask queries',
			agentLimit: '500 Agent commands',
			features: [
				'⚡ Lightning-fast AI responses',
				'🎯 Advanced DeFi strategies',
				'📈 Professional portfolio tracking',
				'🔄 Multi-DEX arbitrage insights',
				'🛡️ Advanced security features',
				'🏆 Priority support',
				'💾 30-day chat history',
				'📊 Detailed analytics dashboard',
				'🔔 Real-time price alerts',
				'💎 Premium yield farming strategies'
			],
			color: '#FF6B6B',
			popular: true
		},
		{
			id: 'enterprise',
			name: 'Enterprise',
			price: '$79.99',
			period: '/month',
			askLimit: 'Unlimited Ask queries',
			agentLimit: 'Unlimited Agent commands',
			features: [
				'🚀 Unlimited everything',
				'🏢 Team collaboration tools',
				'⚙️ Custom AI model training',
				'🔗 White-label integration',
				'📞 Dedicated account manager',
				'🛡️ Enterprise-grade security',
				'💾 Unlimited chat history',
				'📊 Advanced reporting & analytics',
				'🔔 Custom alerts & notifications',
				'💎 Exclusive alpha strategies',
				'🤝 API access & integrations',
				'🎯 Custom smart contract analysis'
			],
			color: '#9B59B6'
		},
		{
			id: 'whale',
			name: 'Whale',
			price: 'Custom',
			period: '',
			askLimit: 'White-glove service',
			agentLimit: 'Personal AI assistant',
			features: [
				'👑 Personal blockchain consultant',
				'🦄 Alpha access to new features',
				'💰 Institutional-grade tools',
				'🤝 Direct line to Aether AI team',
				'🔒 Maximum security & privacy',
				'🎯 Custom strategy development',
				'📈 Personalized market insights',
				'🏆 VIP community access',
				'⚡ Instant priority support',
				'🛡️ Dedicated infrastructure'
			],
			color: '#F39C12'
		}
	]; const handlePlanSelect = (planId: string) => {
		setSelectedPlan(planId);
	};

	const handleSubscribe = (plan: PremiumPlan) => {
		// Here you would integrate with a payment processor like Stripe
		console.log(`Subscribing to ${plan.name} plan`);
		alert(`Redirecting to payment for ${plan.name} plan...`);
	};

	return (
		<div className="premium-page">
			<div className="premium-background">
				<div className="premium-blob blob-1"></div>
				<div className="premium-blob blob-2"></div>
				<div className="premium-blob blob-3"></div>
			</div>

			<div className="premium-container">
				<header className="premium-header">
					{onBack && (
						<button className="back-button" onClick={onBack}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path d="m15 18-6-6 6-6" />
							</svg>
							Back to Chat
						</button>
					)}
					<div className="header-content">
						<img src="/src/assets/aether-logo.png" alt="Aether AI" className="premium-logo" />
						<h1>Unlock the Full Power of Aether AI</h1>
						<p>Choose the perfect plan for your Web3 & DeFi journey</p>
						<div className="header-stats">
							<div className="stat-item">
								<span className="stat-number">50K+</span>
								<span className="stat-label">Active Users</span>
							</div>
							<div className="stat-item">
								<span className="stat-number">$2.1B</span>
								<span className="stat-label">Assets Analyzed</span>
							</div>
							<div className="stat-item">
								<span className="stat-number">99.9%</span>
								<span className="stat-label">Uptime</span>
							</div>
						</div>
					</div>
				</header>

				<div className="pricing-cards">
					{plans.map((plan) => (
						<div
							key={plan.id}
							className={`pricing-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
							style={{ borderColor: plan.color }}
							onClick={() => handlePlanSelect(plan.id)}
						>
							{plan.popular && <div className="popular-badge">Most Popular</div>}

							<div className="plan-header" style={{ backgroundColor: `${plan.color}20` }}>
								<h3 style={{ color: plan.color }}>{plan.name}</h3>
								<div className="price">
									<span className="price-amount">{plan.price}</span>
									<span className="price-period">{plan.period}</span>
								</div>
							</div>

							<div className="plan-limits">
								<div className="limit-item">
									<span className="limit-icon">🤖</span>
									<span>{plan.askLimit}</span>
								</div>
								<div className="limit-item">
									<span className="limit-icon">⚡</span>
									<span>{plan.agentLimit}</span>
								</div>
							</div>

							<div className="plan-features">
								{plan.features.map((feature, index) => (
									<div key={index} className="feature-item">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<polyline points="20 6 9 17 4 12" />
										</svg>
										<span>{feature}</span>
									</div>
								))}
							</div>

							<button
								className="select-plan-btn"
								style={{ backgroundColor: plan.color }}
								onClick={() => handleSubscribe(plan)}
							>
								{selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
							</button>
						</div>
					))}
				</div>

				<div className="premium-features">
					<h2>Why Choose Aether AI Premium?</h2>
					<div className="features-grid">
						<div className="feature-box">
							<div className="feature-icon">🚀</div>
							<h4>10x Faster Analysis</h4>
							<p>Get instant insights on complex DeFi protocols and market movements with our advanced AI</p>
						</div>
						<div className="feature-box">
							<div className="feature-icon">⚡</div>
							<h4>Smart Agent Commands</h4>
							<p>Execute blockchain transactions directly through intuitive AI commands</p>
						</div>
						<div className="feature-box">
							<div className="feature-icon">�</div>
							<h4>Alpha Strategies</h4>
							<p>Access exclusive yield farming and arbitrage opportunities before they go mainstream</p>
						</div>
						<div className="feature-box">
							<div className="feature-icon">🛡️</div>
							<h4>Bank-Grade Security</h4>
							<p>We never store private keys. All wallet interactions are processed securely on-device.</p>
						</div>
						<div className="feature-box">
							<div className="feature-icon">📈</div>
							<h4>Real-Time Alerts</h4>
							<p>Never miss important market movements, liquidation risks, or profitable opportunities</p>
						</div>
						<div className="feature-box">
							<div className="feature-icon">🤝</div>
							<h4>24/7 AI Support</h4>
							<p>Get instant help with DeFi strategies, smart contracts, and blockchain analysis anytime</p>
						</div>
					</div>
				</div>

				{/* Trust Section */}
				<section className="trust-section">
					<div className="trust-indicators">
						<div className="trust-item">
							<span className="trust-icon">🔒</span>
							<span>SOC 2 Certified</span>
						</div>
						<div className="trust-item">
							<span className="trust-icon">✅</span>
							<span>7-Day Free Trial</span>
						</div>
						<div className="trust-item">
							<span className="trust-icon">💰</span>
							<span>Money-Back Guarantee</span>
						</div>
						<div className="trust-item">
							<span className="trust-icon">📞</span>
							<span>24/7 Support</span>
						</div>
					</div>
				</section>				<div className="premium-faq">
					<h2>Frequently Asked Questions</h2>
					<div className="faq-grid">
						<div className="faq-item">
							<h4>Can I change plans anytime?</h4>
							<p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
						</div>
						<div className="faq-item">
							<h4>What happens if I exceed my limits?</h4>
							<p>You'll be notified when approaching limits. Excess usage will be charged at standard rates.</p>
						</div>
						<div className="faq-item">
							<h4>Is there a free trial?</h4>
							<p>New users get 10 free Ask queries and 5 Agent commands to try our service.</p>
						</div>
						<div className="faq-item">
							<h4>How secure is my wallet data?</h4>
							<p>We never store private keys. All wallet interactions are processed securely on-device.</p>
						</div>
					</div>
				</div>

				<footer className="premium-footer">
					<p>Questions? Contact our support team at <a href="mailto:support@aether-ai.com">support@aether-ai.com</a></p>
				</footer>
			</div>
		</div>
	);
};

export default PremiumPage;
