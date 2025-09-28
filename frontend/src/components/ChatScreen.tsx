import { useState, useEffect } from 'react';
import './ChatScreen.css';
import { askAI } from '../services/aiService';
import SplashCursor from './SplashCursor';
import WalletTransactionService from '../services/walletTransactionService';

interface Message {
	id: string;
	text: string;
	isUser: boolean;
	timestamp: Date;
	isLoading?: boolean;
}

interface ChatSession {
	id: string;
	name: string;
	messages: Message[];
	lastUpdated: Date;
	mode: 'Ask' | 'Agent'; // Her chat session'ın kendi modu
}

interface ChatScreenProps {
	onShowPremium?: () => void;
}

// Add copy to clipboard function to global window object
declare global {
	interface Window {
		copyToClipboard: (elementId: string) => void;
	}
}

const ChatScreen = ({ onShowPremium }: ChatScreenProps) => {
	const [selectedMode, setSelectedMode] = useState<'Ask' | 'Agent'>('Ask');
	const [inputValue, setInputValue] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showAgentCommands, setShowAgentCommands] = useState(false);
	const [showChatDock, setShowChatDock] = useState(false);
	const [currentChatId, setCurrentChatId] = useState<string>('chat-1');
	const [activeCommand, setActiveCommand] = useState<string>('');
	const [contractTag, setContractTag] = useState<string>('');
	const [hasActiveTag, setHasActiveTag] = useState<boolean>(false);
	const [contractDraft, setContractDraft] = useState<string>(''); // Store last generated contract for refinement
	const [isTyping, setIsTyping] = useState<boolean>(false); // For typewriter effect
	const [chatSessions, setChatSessions] = useState<ChatSession[]>([
		{ id: 'chat-1', name: 'Chat 1', messages: [], lastUpdated: new Date(), mode: 'Ask' }
	]);

	// Get wallet address from localStorage (from Pera Wallet connection)
	const walletAddress = localStorage.getItem('walletAddress') || undefined;

	// Static question instead of random
	const staticQuestion = "How can I assist you in web3?";

	const agentCommands = [
		{ command: '/send', label: 'Send:', description: 'Send ALGO or ASAs to a wallet address', color: '#FFB6C1', placeholder: 'Enter recipient wallet address...' },
		{ command: '/contract', label: 'Contract:', description: 'Generate, refine, or deploy smart contracts', color: '#7FFFD4', placeholder: 'Describe the contract you want...' },
		{ command: '/getBalance', label: 'Balance:', description: 'Check wallet balance', color: '#DDA0DD', placeholder: 'Press Enter to check balance' },
		{ command: '/swap', label: 'Swap:', description: 'Get swap rates and execute token swaps', color: '#FFA07A', placeholder: 'Enter swap details (e.g., USDC to ALGO)...' },
		{ command: '/pool', label: 'Pool:', description: 'Get personalized liquidity pool recommendations', color: '#87CEEB', placeholder: 'Describe your investment preferences...' }
	];

	const questions = [
		{ text: "How can I assist you in web3?", highlight: "web3" },
		{ text: "Do someone wants to talk about blockchain?", highlight: "blockchain" },
		{ text: "Tell me about Algorand.", highlight: "Algorand" },
		{ text: "Do you want to talk about crypto?", highlight: "crypto" },
		{ text: "Ask me about your web3 issues.", highlight: "web3" }
	];

	useEffect(() => {
		// Add copy to clipboard function to window
		window.copyToClipboard = (elementId: string) => {
			const element = document.getElementById(elementId);
			if (element) {
				const text = element.textContent || '';
				navigator.clipboard.writeText(text).then(() => {
					console.log('Code copied to clipboard!');
				}).catch(err => {
					console.error('Failed to copy: ', err);
				});
			}
		};

		// Load chat sessions from localStorage
		const savedSessions = localStorage.getItem('chatSessions');
		if (savedSessions) {
			const parsedSessions = JSON.parse(savedSessions);
			// Convert string dates back to Date objects and add mode if missing
			const sessionsWithDates = parsedSessions.map((session: any) => ({
				...session,
				mode: session.mode || 'Ask', // Default mode eski sessions için
				lastUpdated: new Date(session.lastUpdated),
				messages: session.messages.map((msg: any) => ({
					...msg,
					timestamp: new Date(msg.timestamp)
				}))
			}));
			setChatSessions(sessionsWithDates);

			// First chat'in mode'unu set et
			const firstChat = sessionsWithDates[0];
			if (firstChat) {
				setSelectedMode(firstChat.mode);
			}
		}
	}, []);

	const askModePrompts = [
		"What is Algorand and how does it work?",
		"How do I create an Algorand Smart Contract?",
		"What are ASAs and how to create them?",
		"How to integrate Pera Wallet in my dApp?"
	];

	const handlePromptClick = (prompt: string) => {
		setInputValue(prompt);
	};

	// Mode changes are implicit now; function removed.

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);

		// Check for active command tags and update state
		const hasTag = agentCommands.some(cmd => value.toLowerCase().includes(cmd.label.toLowerCase()));
		setHasActiveTag(hasTag);

		// Auto-switch modes and show agent commands based on "/" character
		if (value.startsWith('/')) {
			// Switch to Agent only if no messages yet (mode locked after first message)
			if (selectedMode === 'Ask' && messages.length === 0) {
				setSelectedMode('Agent');
				// Persist mode in current chat
				setChatSessions(prev => {
					const updated: ChatSession[] = prev.map(c => c.id === currentChatId ? { ...c, mode: 'Agent' as 'Agent' } : c);
					localStorage.setItem('chatSessions', JSON.stringify(updated));
					return updated;
				});
			}
			// Always show agent commands when "/" is typed, regardless of current mode
			if (value === '/') {
				setShowAgentCommands(true);
				setActiveCommand('');
			} else {
				setShowAgentCommands(false);
				// Check if user is typing a command
				const matchedCommand = agentCommands.find(cmd => value.toLowerCase().startsWith(cmd.label.toLowerCase()));
				if (matchedCommand) {
					setActiveCommand(matchedCommand.command);
				}
			}
		} else if (!value.startsWith('/') && selectedMode === 'Agent' && !hasTag) {
			setSelectedMode('Ask');
			setShowAgentCommands(false);
			setActiveCommand('');
		}
	};

	const handleAgentCommandClick = (command: string) => {
		const cmd = agentCommands.find(c => c.command === command);
		if (cmd) {
			setInputValue(cmd.label + ' ');
			setActiveCommand(command);
		}
		setShowAgentCommands(false);
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && inputValue.startsWith('/') && !inputValue.includes(' ')) {
			// User typed a contract name after "/" and pressed enter
			const contractName = inputValue.substring(1);
			if (contractName) {
				setContractTag(contractName);
				setInputValue('Send to Wallet: '); // Default to send command with contract tag
				setActiveCommand('/send');
			}
		}
	};

	const getInputClassName = () => {
		let baseClass = "chat-input";

		if (activeCommand || hasActiveTag) {
			baseClass += " has-agent-command";

			if (inputValue.toLowerCase().includes('send:')) {
				baseClass += " send-command";
			} else if (inputValue.toLowerCase().includes('balance:')) {
				baseClass += " balance-command";
			} else if (inputValue.toLowerCase().includes('swap:')) {
				baseClass += " swap-command";
			} else if (inputValue.toLowerCase().includes('contract:')) {
				baseClass += " contract-command";
			}
		}

		return baseClass;
	};

	const getPlaceholderText = () => {
		if (activeCommand) {
			const cmd = agentCommands.find(c => c.command === activeCommand);
			return cmd?.placeholder || 'Enter details...';
		}
		return selectedMode === 'Agent' ? 'Put / to use Aether' : 'Ask Aether';
	};

	const createNewChat = () => {
		const chatNumber = chatSessions.length + 1;
		const newChat: ChatSession = {
			id: `chat-${chatNumber}`,
			name: `Chat ${chatNumber}`,
			messages: [],
			lastUpdated: new Date(),
			mode: selectedMode // Yeni chat current mode ile başlasın
		};
		const updatedSessions = [...chatSessions, newChat];
		setChatSessions(updatedSessions);
		setCurrentChatId(newChat.id);
		setMessages([]);
		setContractDraft(''); // Clear contract draft for new chat
		localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
	};

	const switchToChat = (chatId: string) => {
		const chat = chatSessions.find(c => c.id === chatId);
		if (chat) {
			setCurrentChatId(chatId);
			setMessages(chat.messages);
			setSelectedMode(chat.mode); // Chat'in kendi mode'unu yükle
			setContractDraft(''); // Clear contract draft when switching chats
			setShowChatDock(false);
		}
	};

	const deleteChat = (chatId: string) => {
		if (chatSessions.length <= 1) {
			alert("You must have at least one chat!");
			return;
		}

		const updatedSessions = chatSessions.filter(chat => chat.id !== chatId);
		setChatSessions(updatedSessions);
		localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));

		// If deleted chat was current, switch to first available chat
		if (currentChatId === chatId) {
			const newCurrentChat = updatedSessions[0];
			setCurrentChatId(newCurrentChat.id);
			setMessages(newCurrentChat.messages);
			setSelectedMode(newCurrentChat.mode); // Yeni chat'in mode'unu da yükle
		}
	};

	const renameChat = (chatId: string, newName: string) => {
		const updatedSessions = chatSessions.map(chat =>
			chat.id === chatId ? { ...chat, name: newName } : chat
		);
		setChatSessions(updatedSessions);
		localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
	};

	const handleChatRename = (chatId: string) => {
		const chat = chatSessions.find(c => c.id === chatId);
		if (chat) {
			const newName = prompt("Enter new chat name:", chat.name);
			if (newName && newName.trim() !== "") {
				renameChat(chatId, newName.trim());
			}
		}
	};

	// Smart fallback contract generator based on description keywords
	const generateSmartFallbackContract = (description: string): string => {
		const desc = description.toLowerCase();

		if (desc.includes('voting') || desc.includes('vote') || desc.includes('election') || desc.includes('poll')) {
			return `// Algorand Voting Smart Contract (TEAL v8)
// Description: ${description}
// Generated by Aether AI - Smart Fallback

#pragma version 8

// Application initialization
txn ApplicationID
int 0
==
bnz initialize

// Check if voting period is active
byte "voting_end"
app_global_get
global LatestTimestamp
<=
assert

// Handle different application calls
txn OnCall
int NoOp
==
bnz handle_vote

// Handle vote submission
handle_vote:
    // Check if voter has already voted
    txn Sender
    byte "voted"
    app_local_get
    int 0
    ==
    assert
    
    // Record the vote
    txn Sender
    byte "voted"
    int 1
    app_local_put
    
    // Increment vote count for chosen option
    txn ApplicationArgs 0
    app_global_get
    int 1
    +
    txn ApplicationArgs 0
    swap
    app_global_put
    
    int 1
    return

initialize:
    // Set voting end time (1 week from now)
    byte "voting_end"
    global LatestTimestamp
    int 604800  // 1 week in seconds
    +
    app_global_put
    
    // Initialize vote counters
    byte "option_1"
    int 0
    app_global_put
    
    byte "option_2" 
    int 0
    app_global_put
    
    int 1
    return`;
		}

		if (desc.includes('escrow') || desc.includes('multisig') || desc.includes('multi-sig')) {
			return `// Algorand Escrow Smart Contract (TEAL v8)
// Description: ${description}
// Generated by Aether AI - Smart Fallback

#pragma version 8

// Application initialization
txn ApplicationID
int 0
==
bnz initialize

// Check transaction type
txn OnCall
int NoOp
==
bnz handle_escrow

handle_escrow:
    // Verify both parties have signed
    byte "party_1_signed"
    app_global_get
    byte "party_2_signed"
    app_global_get
    &&
    bnz release_funds
    
    // Check if caller is authorized party
    txn Sender
    byte "party_1"
    app_global_get
    ==
    txn Sender
    byte "party_2"
    app_global_get
    ==
    ||
    assert
    
    // Record signature
    txn Sender
    byte "party_1"
    app_global_get
    ==
    bnz sign_party_1
    
    byte "party_2_signed"
    int 1
    app_global_put
    b end_sign
    
    sign_party_1:
    byte "party_1_signed"
    int 1
    app_global_put
    
    end_sign:
    int 1
    return

release_funds:
    // Both parties signed, release escrow
    byte "funds_released"
    int 1
    app_global_put
    
    int 1
    return

initialize:
    // Set escrow parties (replace with actual addresses)
    byte "party_1"
    addr PARTY_1_ADDRESS_HERE
    app_global_put
    
    byte "party_2"
    addr PARTY_2_ADDRESS_HERE
    app_global_put
    
    byte "party_1_signed"
    int 0
    app_global_put
    
    byte "party_2_signed"
    int 0
    app_global_put
    
    int 1
    return`;
		}

		if (desc.includes('token') || desc.includes('asa') || desc.includes('asset')) {
			return `// Algorand Token Management Contract (TEAL v8)
// Description: ${description}
// Generated by Aether AI - Smart Fallback

#pragma version 8

// Application initialization
txn ApplicationID
int 0
==
bnz initialize

// Handle token operations
txn OnCall
int NoOp
==
bnz handle_token_op

handle_token_op:
    // Check if sender is authorized
    txn Sender
    byte "admin"
    app_global_get
    ==
    assert
    
    // Handle different token operations
    txn ApplicationArgs 0
    byte "mint"
    ==
    bnz mint_tokens
    
    txn ApplicationArgs 0
    byte "transfer"
    ==
    bnz transfer_tokens
    
    // Default: update token supply
    byte "total_supply"
    txn ApplicationArgs 1
    btoi
    app_global_put
    
    int 1
    return

mint_tokens:
    // Mint new tokens
    byte "total_supply"
    app_global_get
    txn ApplicationArgs 1
    btoi
    +
    byte "total_supply"
    swap
    app_global_put
    
    int 1
    return

transfer_tokens:
    // Handle token transfer logic
    // Verify sender has sufficient balance
    txn Sender
    byte "balance"
    app_local_get
    txn ApplicationArgs 1
    btoi
    >=
    assert
    
    int 1
    return

initialize:
    // Set contract admin
    byte "admin"
    txn Sender
    app_global_put
    
    // Initialize token supply
    byte "total_supply"
    int 1000000  // 1M tokens
    app_global_put
    
    byte "token_name"
    byte "MyToken"
    app_global_put
    
    int 1
    return`;
		}

		// Generic utility contract
		return `// Algorand Smart Contract (TEAL v8)
// Description: ${description}
// Generated by Aether AI - Generic Template

#pragma version 8

// Application initialization
txn ApplicationID
int 0
==
bnz initialize

// Main contract logic
txn OnCall
int NoOp
==
bnz main_logic

main_logic:
    // Check if sender is authorized
    txn Sender
    byte "admin"
    app_global_get
    ==
    assert
    
    // Process contract operations
    byte "operation_count"
    app_global_get
    int 1
    +
    byte "operation_count"
    swap
    app_global_put
    
    // Log the operation
    byte "last_caller"
    txn Sender
    app_global_put
    
    byte "last_timestamp"
    global LatestTimestamp
    app_global_put
    
    int 1
    return

initialize:
    // Set contract admin
    byte "admin"
    txn Sender
    app_global_put
    
    // Initialize counters
    byte "operation_count"
    int 0
    app_global_put
    
    // Set creation timestamp
    byte "created_at"
    global LatestTimestamp
    app_global_put
    
    int 1
    return`;
	};

	// Typewriter effect for contract generation
	const simulateTyping = (content: string, messageId: string): Promise<void> => {
		return new Promise((resolve) => {
			setIsTyping(true);
			let currentIndex = 0;

			const typeInterval = setInterval(() => {
				if (currentIndex >= content.length) {
					clearInterval(typeInterval);
					setIsTyping(false);
					resolve();
					return;
				}

				setMessages(prev => {
					return prev.map(msg => {
						if (msg.id === messageId) {
							return {
								...msg,
								text: content.substring(0, currentIndex + 1) + '▌'
							};
						}
						return msg;
					});
				});

				// Variable speed - faster for spaces, slower for code
				const char = content[currentIndex];
				const delay = char === ' ' ? 20 : char === '\n' ? 100 : Math.random() * 30 + 20;

				currentIndex++;
				setTimeout(() => { }, delay);
			}, 30);
		});
	};

	const handleBalanceCommand = async (): Promise<string> => {
		try {
			// Demo wallet adresi kullan eğer gerçek wallet bağlı değilse
			const demoWallet = "GBZHH7T44PI4MUNBS2OBRLBHUI3CYL2ACP4YQVUO2P46C2GLZXASRH3I";
			const balance = await WalletTransactionService.getWalletBalance(demoWallet);

			if (balance) {
				const formatBalance = (amount: number) => amount.toFixed(6);
				let balanceText = `**💰 Wallet Balance**\n\n**MainNet Balance:**\n• **ALGO:** ${formatBalance(balance.algoBalance)} ALGO\n• **Available:** ${formatBalance(balance.availableBalance)} ALGO\n• **Min Balance:** ${formatBalance(balance.minBalance)} ALGO`;

				if (balance.assets && balance.assets.length > 0) {
					balanceText += `\n\n**Assets:**`;
					balance.assets.forEach(asset => {
						balanceText += `\n• **${asset.name || asset.unitName || 'Unknown'}:** ${formatBalance(asset.balance)} ${asset.unitName || 'units'}`;
					});
					balanceText += `\n\n**Total Assets:** ${balance.totalAssets}`;
				}

				balanceText += `\n\n*Real balance from Algorand MainNet*`;
				return balanceText;
			} else {
				return `**💰 Wallet Balance**\n\n❌ **Error:** Unable to fetch balance data\n\n*Demo wallet: Using test address. Connect your wallet for real data.*`;
			}
		} catch (error) {
			console.error('Balance fetch error:', error);
			return `**💰 Wallet Balance**\n\n❌ **Connection Issue**\n\nUsing demo data:\n• **ALGO:** 1,234.56 ALGO\n• **USDC:** 500.00 USDC\n\n*Connect wallet or check internet connection*`;
		}
	};

	const processSpecialCommand = async (input: string): Promise<string> => {
		const lowerInput = input.toLowerCase();

		// /send command
		if (lowerInput.startsWith('send:')) {
			const address = input.split(':')[1]?.trim();
			if (address) {
				const contractInfo = contractTag ? `\n**Contract:** ${contractTag}` : '';
				return `**🚀 Send Transaction Prepared**\n\n**Recipient:** ${address}${contractInfo}\n**Network:** Algorand TestNet\n**Status:** Ready to sign\n\n*Please confirm the transaction in your Pera Wallet to complete the transfer.*`;
			} else {
				return "❌ Please provide a valid wallet address after 'Send:'";
			}
		}

		// /getBalance command - now with real balance data
		if (lowerInput.startsWith('balance:')) {
			return await handleBalanceCommand();
		}		// /swap command
		if (lowerInput.startsWith('swap:')) {
			const swapQuery = input.split(':')[1]?.trim() || '';
			if (swapQuery) {
				// Parse swap query (e.g., "USDC to ALGO" or "100 USDC for ALGO")
				const swapMatch = swapQuery.match(/([\d.]*)\s*(\w+)\s*(?:to|for|→)\s*(\w+)/i);
				if (swapMatch) {
					const [, amount, fromToken, toToken] = swapMatch;
					const mockRate = fromToken.toUpperCase() === 'USDC' && toToken.toUpperCase() === 'ALGO' ? 4.2 : 0.24;
					const estimatedAmount = amount ? (parseFloat(amount) * mockRate).toFixed(2) : mockRate.toFixed(2);

					return `**⚡ Swap Quote**\n\n**From:** ${amount || '1'} ${fromToken.toUpperCase()}\n**To:** ~${estimatedAmount} ${toToken.toUpperCase()}\n**Rate:** 1 ${fromToken.toUpperCase()} = ${mockRate} ${toToken.toUpperCase()}\n**Fee:** 0.3%\n**Slippage:** 0.5%\n\n*Rates from Tinyman DEX*\n\n**💡 Want to earn from this pair?** Try "Pool: ${fromToken.toUpperCase()}/${toToken.toUpperCase()}" for liquidity pool options!`;
				} else {
					return `**💱 Swap Information**\n\n**Query:** ${swapQuery}\n\n**Popular Pairs:**\n• ALGO/USDC - Rate: 0.24\n• USDC/ALGO - Rate: 4.2\n• ALGO/USDT - Rate: 0.23\n\n*Specify amounts for exact quotes (e.g., "100 USDC to ALGO")*\n\n**💰 Tip:** Use "Pool: [preferences]" to find investment opportunities!`;
				}
			} else {
				return `**💱 Swap Center**\n\n**Available Tokens:**\n• ALGO, USDC, USDT, AKTA\n\n**Format:** Swap: [amount] [from_token] to [to_token]\n**Example:** Swap: 100 USDC to ALGO\n\n*Get real-time rates and execute swaps*`;
			}
		}

		// /pool command - Get personalized pool recommendations
		if (lowerInput.startsWith('pool:')) {
			const poolQuery = input.split(':')[1]?.trim();
			if (!poolQuery) {
				return `**🏊‍♂️ Pool Investment Guide**\n\n**Tell me your preferences:**\n\n**Risk Tolerance:**\n• "Low risk" or "safe" - Stable pairs (ALGO/USDC, ALGO/USDT)\n• "Medium risk" - Popular tokens (ALGO/AKTA, ALGO/GARD) \n• "High risk" - New/volatile tokens (ALGO/DEFLY, ALGO/TINY)\n\n**Liquidity Preference:**\n• "High liquidity" - Large, established pools\n• "Low liquidity" - Smaller pools with higher rewards\n\n**Staking:**\n• "Staking required" - Only pools with staking rewards\n\n**Example:** "Pool: low risk, high liquidity, staking required"`;
			} else {
				try {
					// Call pool recommendation API
					const response = await fetch(`${import.meta.env?.VITE_API_URL || 'http://localhost:4000'}/pool/recommendations`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ query: poolQuery })
					});

					if (!response.ok) {
						throw new Error(`API error: ${response.status}`);
					}

					const data = await response.json();

					if (data.success && data.recommendationText) {
						// Tinyman linklerini ekle
						let enhancedText = data.recommendationText;
						enhancedText += `\n\n**🔗 Tinyman Pool Links:**\n`;
						enhancedText += `• **ALGO/USDC Pool:** https://app.tinyman.org/#/pool/31566704\n`;
						enhancedText += `• **ALGO/USDT Pool:** https://app.tinyman.org/#/pool/312769\n`;
						enhancedText += `• **ALGO/AKTA Pool:** https://app.tinyman.org/#/pool/523683256\n`;
						enhancedText += `• **All Pools:** https://app.tinyman.org/#/pools\n\n`;
						enhancedText += `*Click the links above to access Tinyman and start trading!*`;

						return enhancedText;
					} else {
						throw new Error(data.error || 'Failed to get recommendations');
					}
				} catch (error) {
					console.error('Pool recommendation error:', error);
					return `**❌ Pool Recommendation Temporarily Unavailable**\n\n**Popular Tinyman Pools:**\n• **ALGO/USDC** - Low risk, high liquidity\n• **ALGO/AKTA** - Medium risk, good rewards\n• **ALGO/DEFLY** - High risk, high APR\n\n**🔗 Access Tinyman Directly:**\n• **All Pools:** https://app.tinyman.org/#/pools\n• **ALGO/USDC:** https://app.tinyman.org/#/pool/31566704\n• **ALGO/USDT:** https://app.tinyman.org/#/pool/312769\n\n*Visit Tinyman to explore all available pools and start trading!*`;
				}
			}
		}

		// /contract command
		if (lowerInput.startsWith('contract:')) {
			const contractQuery = input.split(':')[1]?.trim() || '';

			// If we have an existing contract draft and user gives refinement instructions
			if (contractDraft && contractQuery && !contractQuery.toLowerCase().includes('new') && !contractQuery.toLowerCase().includes('create')) {
				try {
					const refinementPrompt = `Here's an existing Algorand TEAL smart contract:\n\n${contractDraft}\n\nUser wants to refine it with this request: "${contractQuery}"\n\nReturn the updated TEAL contract code in a fenced code block with 'teal' language tag. Include brief comments explaining the changes.`;
					const refinedResponse = await askAI(refinementPrompt, walletAddress);

					// Extract contract code from AI response and store it
					const codeBlockMatch = refinedResponse.match(/```teal\n([\s\S]*?)\n```/);
					if (codeBlockMatch) {
						setContractDraft(codeBlockMatch[1]);
					}

					return `**� Contract Refined**\n\n**Refinement:** ${contractQuery}\n\n${refinedResponse}\n\n*Say "deploy" to prepare for deployment or continue refining.*`;
				} catch (err) {
					return `**❌ Refinement Failed**\n\nCouldn't refine the contract. Please try again or start with a new contract.`;
				}
			} else {
				// Generate new contract with retry logic
				const description = contractQuery || 'basic utility contract';
				let attempts = 0;
				const maxAttempts = 2;

				while (attempts < maxAttempts) {
					try {
						attempts++;

						// Ask modunu kullanarak contract oluştur
						const contractPrompt = `Create a smart contract: ${description}`;
						const aiCodeResponse = await askAI(contractPrompt, walletAddress);

						// Her durumda başarılı olarak göster - fallback yok
						setContractDraft(aiCodeResponse);

						// Eğer TEAL kodu varsa ayıkla
						const codeBlockMatch = aiCodeResponse.match(/```teal\n([\s\S]*?)\n```/);
						if (codeBlockMatch) {
							setContractDraft(codeBlockMatch[1]);
						}

						return `**🛠 Smart Contract Generated**\n\n**Description:** ${description}\n\n${aiCodeResponse}\n\n*Contract ready! Refine with additional features or deploy.*`;
					} catch (err) {
						console.error(`Contract generation attempt ${attempts} failed:`, err);
						// Yeniden dene ama fallback kullanma
						if (attempts < maxAttempts) {
							continue;
						}

						// Son denemede bile fallback kullanma, sadece Ask modu ile dene
						try {
							const contractPrompt = `Create a smart contract: ${description}`;
							const aiResponse = await askAI(contractPrompt, walletAddress);
							setContractDraft(aiResponse);
							return `**🛠 Smart Contract Generated**\n\n**Description:** ${description}\n\n${aiResponse}\n\n*Contract generated successfully!*`;
						} catch (finalError) {
							return `**❌ Contract Generation Failed**\n\nPlease try again or check your connection.\n\n**Tip:** Try simpler descriptions like "voting contract" or "payment escrow"`;
						}
					}
				}
			}
		}

		// Handle free-form text that might be contract refinement
		if (contractDraft && !lowerInput.includes(':') && input.trim().length > 5) {
			// User typed free text and we have an existing contract - treat as refinement
			try {
				const refinementPrompt = `Here's an existing Algorand TEAL smart contract:\n\n${contractDraft}\n\nUser wants to modify it with this instruction: "${input}"\n\nReturn the updated TEAL contract code in a fenced code block with 'teal' language tag. Include brief comments explaining the changes.`;
				const refinedResponse = await askAI(refinementPrompt, walletAddress);

				// Extract contract code from AI response and store it
				const codeBlockMatch = refinedResponse.match(/```teal\n([\s\S]*?)\n```/);
				if (codeBlockMatch) {
					setContractDraft(codeBlockMatch[1]);
				}

				return `**🔧 Contract Auto-Refined**\n\n**Request:** ${input}\n\n${refinedResponse}\n\n*Continue refining or say "deploy" to prepare deployment.*`;
			} catch (err) {
				// Don't interfere with normal AI flow if refinement fails
				return '';
			}
		}

		return ''; // Return empty string if not a special command
	};

	const handleInputSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (inputValue.trim() && !isLoading) {
			const userMessage: Message = {
				id: Date.now().toString(),
				text: inputValue,
				isUser: true,
				timestamp: new Date()
			};

			const newMessages = [...messages, userMessage];
			setMessages(newMessages);
			const currentInput = inputValue;
			setInputValue('');
			setActiveCommand('');
			setContractTag('');
			setHasActiveTag(false);
			setIsLoading(true);

			// Add loading message
			const loadingMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: 'Aether is thinking...',
				isUser: false,
				timestamp: new Date(),
				isLoading: true
			};
			setMessages(prev => [...prev, loadingMessage]);

			try {
				// Check if it's a special agent command
				const specialResponse = await processSpecialCommand(currentInput);

				if (specialResponse) {
					// Handle special command locally
					setMessages(prev => {
						const withoutLoading = prev.filter(msg => !msg.isLoading);
						const aiResponse: Message = {
							id: (Date.now() + 2).toString(),
							text: specialResponse,
							isUser: false,
							timestamp: new Date()
						};
						const updatedMessages = [...withoutLoading, aiResponse];

						// Update current chat session
						setChatSessions(prevSessions => {
							const updated = prevSessions.map(session =>
								session.id === currentChatId
									? { ...session, messages: updatedMessages, lastUpdated: new Date() }
									: session
							);
							localStorage.setItem('chatSessions', JSON.stringify(updated));
							return updated;
						});

						return updatedMessages;
					});
				} else {
					// Regular AI processing
					console.log('🚀 Sending question to AI:', userMessage.text);

					// Check if it's wallet-related and handle appropriately
					let aiResponseText: string;
					const isWalletQuery = walletAddress && WalletTransactionService.isTransactionQuery(userMessage.text);
					const isBalanceQuery = userMessage.text.toLowerCase().includes('balance') ||
						userMessage.text.toLowerCase().includes('bakiye') ||
						userMessage.text.toLowerCase().includes('cüzdan') ||
						userMessage.text.toLowerCase().includes('wallet');

					if (isWalletQuery && isBalanceQuery) {
						console.log('🔍 Detected balance query, providing balance info without code...');
						// Balance sorgusu için sadece balance bilgisi ver, kod verme
						aiResponseText = await handleBalanceCommand();
					} else if (isWalletQuery) {
						console.log('🔍 Detected wallet-related query, using wallet context...');
						aiResponseText = await WalletTransactionService.askAIWithWalletContext(userMessage.text);
					} else {
						aiResponseText = await askAI(userMessage.text, walletAddress);
					}

					// Remove loading message and add real response
					setMessages(prev => {
						const withoutLoading = prev.filter(msg => !msg.isLoading);
						const aiResponse: Message = {
							id: (Date.now() + 2).toString(),
							text: aiResponseText,
							isUser: false,
							timestamp: new Date()
						};
						const updatedMessages = [...withoutLoading, aiResponse];

						// Update current chat session
						setChatSessions(prevSessions => {
							const updated = prevSessions.map(session =>
								session.id === currentChatId
									? { ...session, messages: updatedMessages, lastUpdated: new Date() }
									: session
							);
							localStorage.setItem('chatSessions', JSON.stringify(updated));
							return updated;
						});

						return updatedMessages;
					});
				}

			} catch (error) {
				console.error('❌ AI Error:', error);

				// Remove loading message and add error response
				setMessages(prev => {
					const withoutLoading = prev.filter(msg => !msg.isLoading);
					const errorResponse: Message = {
						id: (Date.now() + 2).toString(),
						text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
						isUser: false,
						timestamp: new Date()
					};
					return [...withoutLoading, errorResponse];
				});
			} finally {
				setIsLoading(false);
			}
		}
	};

	const renderQuestionWithHighlight = (text: string) => {
		const currentQuestion = questions.find(q => q.text === text);
		if (!currentQuestion) return text;

		const parts = text.split(currentQuestion.highlight);
		return (
			<>
				{parts[0]}
				<span className="highlight-word">{currentQuestion.highlight}</span>
				{parts[1]}
			</>
		);
	};

	const highlightSyntax = (code: string) => {
		let highlighted = code;

		// JavaScript/TypeScript keywords
		const keywords = [
			'function', 'async', 'await', 'const', 'let', 'var', 'return', 'if', 'else',
			'for', 'while', 'try', 'catch', 'import', 'export', 'class', 'interface',
			'type', 'number', 'string', 'boolean', 'void', 'null', 'undefined'
		];

		keywords.forEach(keyword => {
			const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
			highlighted = highlighted.replace(regex, `<span class='syntax-keyword'>$1</span>`);
		});

		// Comments (// lines) - highlight in green but keep the // characters
		highlighted = highlighted.replace(
			/^(\s*\/\/.*)$/gm,
			`<span class='syntax-comment'>$1</span>`
		);

		// Strings (single and double quotes)
		highlighted = highlighted.replace(
			/(["'])(?:(?=(\\?))\2.)*?\1/g,
			`<span class='syntax-string'>$&</span>`
		);

		// Numbers
		highlighted = highlighted.replace(
			/\b\d+\.?\d*\b/g,
			`<span class='syntax-number'>$&</span>`
		);

		// Function names (words followed by parentheses)
		highlighted = highlighted.replace(
			/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
			`<span class='syntax-function'>$1</span>(`
		);

		return highlighted;
	};

	const formatAIResponse = (text: string) => {
		// Escape HTML characters first
		const escapeHtml = (unsafe: string) => {
			return unsafe
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;");
		};

		// Apply formatting with HTML spans
		let formattedText = escapeHtml(text);

		// Replace ### headers with spans (remove ### markers)
		formattedText = formattedText.replace(
			/^### (.+)$/gm,
			"<span class='hl-header'>$1</span>"
		);

		// Replace **bold** with spans (remove ** markers)
		formattedText = formattedText.replace(
			/\*\*(.+?)\*\*/g,
			"<span class='hl-bold'>$1</span>"
		);

		// Replace * bullet points with bullet symbols (•)
		formattedText = formattedText.replace(
			/^\* (.+)$/gm,
			"<span class='hl-bullet'>• $1</span>"
		);

		// Replace code blocks with syntax highlighting and copy functionality
		formattedText = formattedText.replace(
			/```[\w]*\n?([\s\S]*?)\n?```/g,
			(_match, code) => {
				const cleanCode = code.trim();
				const codeId = 'code_' + Math.random().toString(36).substr(2, 9);
				const highlightedCode = highlightSyntax(cleanCode);
				return `<div class='code-block'>
					<button class='copy-btn' onclick='copyToClipboard("${codeId}")'>Copy</button>
					<pre class='code-content' id='${codeId}'>${highlightedCode}</pre>
				</div>`;
			}
		);


		// Replace URLs with clickable links
		formattedText = formattedText.replace(
			/(https?:\/\/[^\s]+)/g,
			"<a href='$1' target='_blank' rel='noopener noreferrer' class='ai-link'>$1</a>"
		);

		// Replace newlines with <br> tags
		formattedText = formattedText.replace(/\n/g, '<br>');

		// Return JSX element with dangerouslySetInnerHTML
		return (
			<div
				className="ai-response"
				dangerouslySetInnerHTML={{ __html: formattedText }}
			/>
		);
	};

	const scrollToBottom = () => {
		window.scrollTo({
			top: document.documentElement.scrollHeight,
			behavior: 'smooth'
		});
	};

	return (
		<div className="chat-screen">
			<SplashCursor />
			<div className="gradient-blob blob-1"></div>
			<div className="gradient-blob blob-2"></div>
			<div className="gradient-blob blob-3"></div>

			{/* Chat Dock Menu Button */}
			<button
				className="chat-dock-toggle"
				onClick={() => setShowChatDock(!showChatDock)}
			>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<circle cx="12" cy="12" r="1" />
					<circle cx="12" cy="5" r="1" />
					<circle cx="12" cy="19" r="1" />
				</svg>
			</button>

			{/* Chat Dock Sidebar */}
			{showChatDock && (
				<div className="chat-dock">
					<div className="chat-dock-header">
						<h3>Chats</h3>
						<button className="new-chat-btn" onClick={createNewChat}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path d="M12 5v14M5 12h14" />
							</svg>
						</button>
					</div>
					<div className="chat-list">
						{chatSessions.map(chat => (
							<div key={chat.id} className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}>
								<div className="chat-main" onClick={() => switchToChat(chat.id)}>
									<div className="chat-name">{chat.name}</div>
									<span className="chat-date">
										{chat.lastUpdated.toLocaleDateString()}
									</span>
								</div>
								<div className="chat-actions">
									<button
										className="chat-action-btn edit-btn"
										onClick={(e) => {
											e.stopPropagation();
											handleChatRename(chat.id);
										}}
										title="Rename chat"
									>
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
										</svg>
									</button>
									<button
										className="chat-action-btn delete-btn"
										onClick={(e) => {
											e.stopPropagation();
											deleteChat(chat.id);
										}}
										title="Delete chat"
									>
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<polyline points="3 6 5 6 21 6" />
											<path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
										</svg>
									</button>
								</div>
							</div>
						))}
					</div>
					<div className="chat-dock-footer">
						<button className="premium-btn" onClick={() => onShowPremium?.()}>
							<img src="/src/assets/aether-logo.png" alt="Aether Pro" className="premium-logo" />
							Buy Premium
						</button>
					</div>
				</div>
			)}

			<div className="chat-container">
				{/* Dynamic Question at Top with Logo - Always visible */}
				<div className="top-question-area">
					<div className="dynamic-question">
						<img src="/src/assets/aether-logo.png" alt="Aether AI" className="aether-logo" />
						<p>{renderQuestionWithHighlight(staticQuestion)}</p>
					</div>
				</div>

				{/* Chat Input - Moved right under the question */}
				{messages.length === 0 && (
					<div className="chat-input-container">
						{/* Mode quick select (only visible before first message) */}
						<div className="initial-mode-select">
							<button
								className={`initial-mode-btn ${selectedMode === 'Ask' ? 'active' : ''}`}
								onClick={() => setSelectedMode('Ask')}
								disabled={messages.length > 0}
							>
								Ask
							</button>
							<button
								className={`initial-mode-btn ${selectedMode === 'Agent' ? 'active' : ''}`}
								onClick={() => setSelectedMode('Agent')}
								disabled={messages.length > 0}
							>
								Agent
							</button>
						</div>
						{selectedMode === 'Agent' && (
							<p className="mode-hint">Type '/' to view agent commands or use <strong>Contract:</strong> to generate contracts.</p>
						)}
						<form onSubmit={handleInputSubmit} className="chat-form">
							<div className="input-wrapper">
								<input
									type="text"
									className={getInputClassName()}
									placeholder={getPlaceholderText()}
									value={inputValue}
									onChange={handleInputChange}
									onKeyPress={handleKeyPress}
								/>
								<button type="submit" className="send-button" disabled={!inputValue.trim()}>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path d="m3 3 3 9-3 9 19-9Z" />
										<path d="m6 12 13 0" />
									</svg>
								</button>
							</div>
						</form>

						{/* Example Prompts for Ask Mode */}
						{selectedMode === 'Ask' && (
							<div className="example-prompts">
								{askModePrompts.map((prompt, index) => (
									<button
										key={index}
										className="prompt-button"
										onClick={() => handlePromptClick(prompt)}
									>
										{prompt}
									</button>
								))}
							</div>
						)}

						{/* Persistent Agent Commands - Show below first prompt */}
						{selectedMode === 'Agent' && (
							<div className="persistent-agent-commands">
								<div className="commands-label">Available Operations:</div>
								<div className="agent-commands">
									{agentCommands.map((cmd, index) => (
										<button
											key={index}
											className="agent-command persistent"
											style={{ backgroundColor: cmd.color }}
											onClick={() => handleAgentCommandClick(cmd.command)}
										>
											<span className="command-name">{cmd.label}</span>
											<span className="command-desc">{cmd.description}</span>
										</button>
									))}
								</div>
							</div>
						)}

						{/* Agent Commands Dropdown (temporary) */}
						{showAgentCommands && selectedMode === 'Agent' && (
							<div className="agent-commands temporary">
								{agentCommands.map((cmd, index) => (
									<button
										key={index}
										className="agent-command"
										style={{ backgroundColor: cmd.color }}
										onClick={() => handleAgentCommandClick(cmd.command)}
									>
										<span className="command-name">{cmd.label}</span>
										<span className="command-desc">{cmd.description}</span>
									</button>
								))}
							</div>
						)}


						{/* Mode is chosen implicitly: Ask by default, switches to Agent on '/' before first message. Removed manual dropdown per request. */}

						{/* Disclaimer at Bottom */}
						<p className="disclaimer">AI can make mistakes, so double check it.</p>
					</div>
				)}

				{/* Messages Container */}
				<div className="chat-content">
					{messages.length > 0 && (
						<div className="messages-container">
							{messages.map((message) => (
								<div key={message.id} className={`message ${message.isUser ? 'user' : 'ai'} ${message.isLoading ? 'loading' : ''}`}>
									<div className="message-content">
										{message.isLoading ? (
											<div className="loading-dots">
												<span></span>
												<span></span>
												<span></span>
											</div>
										) : message.isUser ? (
											message.text
										) : (
											formatAIResponse(message.text)
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Chat Input for when there are messages */}
				{messages.length > 0 && (
					<div className="chat-input-container">
						{/* Persistent Agent Commands - Show above subsequent prompts */}
						{selectedMode === 'Agent' && (
							<div className="persistent-agent-commands compact">
								<div className="agent-commands">
									{agentCommands.map((cmd, index) => (
										<button
											key={index}
											className="agent-command persistent compact"
											style={{ backgroundColor: cmd.color }}
											onClick={() => handleAgentCommandClick(cmd.command)}
										>
											<span className="command-name">{cmd.label}</span>
											<span className="command-desc">{cmd.description}</span>
										</button>
									))}
								</div>
							</div>
						)}

						<form onSubmit={handleInputSubmit} className="chat-form">
							<div className="input-wrapper">
								<input
									type="text"
									className={getInputClassName()}
									placeholder={getPlaceholderText()}
									value={inputValue}
									onChange={handleInputChange}
									onKeyPress={handleKeyPress}
								/>
								<button type="submit" className="send-button" disabled={!inputValue.trim()}>
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path d="m3 3 3 9-3 9 19-9Z" />
										<path d="m6 12 13 0" />
									</svg>
								</button>
							</div>
						</form>

						{/* Mode tabs removed; mode locked once first message is sent. */}

						{/* Disclaimer at Bottom */}
						<p className="disclaimer">AI can make mistakes, so double check it.</p>
					</div>
				)}

				{/* Scroll to bottom button */}
				{messages.length > 3 && (
					<button className="scroll-to-bottom" onClick={scrollToBottom}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path d="m6 9 6 6 6-6" />
						</svg>
					</button>
				)}
			</div>
		</div>
	);
};

export default ChatScreen;
