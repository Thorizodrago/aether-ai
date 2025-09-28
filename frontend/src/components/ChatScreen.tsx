import { useState, useEffect } from 'react';
import './ChatScreen.css';
import { askAI } from '../services/aiService';
import SplashCursor from './SplashCursor';

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
		{ command: '/swap', label: 'Swap:', description: 'Get swap rates and execute token swaps', color: '#FFA07A', placeholder: 'Enter swap details (e.g., USDC to ALGO)...' }
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
		localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
	};

	const switchToChat = (chatId: string) => {
		const chat = chatSessions.find(c => c.id === chatId);
		if (chat) {
			setCurrentChatId(chatId);
			setMessages(chat.messages);
			setSelectedMode(chat.mode); // Chat'in kendi mode'unu yükle
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

		// /getBalance command
		if (lowerInput.startsWith('balance:')) {
			return `**💰 Wallet Balance**\n\n**MainNet Balance:**\n• **ALGO:** 1,234.56 ALGO\n• **USDC:** 500.00 USDC\n• **USDT:** 250.75 USDT\n\n**Total USD Value:** ~$2,847.32\n\n*Balance updated in real-time*`;
		}

		// /swap command
		if (lowerInput.startsWith('swap:')) {
			const swapQuery = input.split(':')[1]?.trim() || '';
			if (swapQuery) {
				// Parse swap query (e.g., "USDC to ALGO" or "100 USDC for ALGO")
				const swapMatch = swapQuery.match(/([\d.]*)\s*(\w+)\s*(?:to|for|→)\s*(\w+)/i);
				if (swapMatch) {
					const [, amount, fromToken, toToken] = swapMatch;
					const mockRate = fromToken.toUpperCase() === 'USDC' && toToken.toUpperCase() === 'ALGO' ? 4.2 : 0.24;
					const estimatedAmount = amount ? (parseFloat(amount) * mockRate).toFixed(2) : mockRate.toFixed(2);

					return `**⚡ Swap Quote**\n\n**From:** ${amount || '1'} ${fromToken.toUpperCase()}\n**To:** ~${estimatedAmount} ${toToken.toUpperCase()}\n**Rate:** 1 ${fromToken.toUpperCase()} = ${mockRate} ${toToken.toUpperCase()}\n**Fee:** 0.3%\n**Slippage:** 0.5%\n\n*Rates from Tinyman DEX. Click to execute swap.*`;
				} else {
					return `**💱 Swap Information**\n\n**Query:** ${swapQuery}\n\n**Popular Pairs:**\n• ALGO/USDC - Rate: 0.24\n• USDC/ALGO - Rate: 4.2\n• ALGO/USDT - Rate: 0.23\n\n*Specify amounts for exact quotes (e.g., "100 USDC to ALGO")*`;
				}
			} else {
				return `**💱 Swap Center**\n\n**Available Tokens:**\n• ALGO, USDC, USDT, AKTA\n\n**Format:** Swap: [amount] [from_token] to [to_token]\n**Example:** Swap: 100 USDC to ALGO\n\n*Get real-time rates and execute swaps*`;
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
				// Generate new contract
				try {
					const description = contractQuery || 'basic utility contract';
					const prompt = `You are an Algorand smart contract generator. Generate a TEAL v8 contract based on this description: "${description}".\nReturn ONLY a fenced code block with 'teal' as language and include minimal explanatory header comments. Focus on functionality, state management, and access control.`;
					const aiCodeResponse = await askAI(prompt, walletAddress);

					// Extract and store contract code for future refinement
					const codeBlockMatch = aiCodeResponse.match(/```teal\n([\s\S]*?)\n```/);
					if (codeBlockMatch) {
						setContractDraft(codeBlockMatch[1]);
					}

					if (/```/.test(aiCodeResponse)) {
						return `**🛠 Contract Generated**\n\n**Description:** ${description}\n\n${aiCodeResponse}\n\n*Refine with: "Contract: add daily limits" or deploy with: "Contract: deploy"*`;
					}
					// Fallback if no code block in response
					setContractDraft(aiCodeResponse);
					return `**🛠 Contract Generated**\n\n**Description:** ${description}\n\n\`\`\`teal\n${aiCodeResponse}\n\`\`\`\n\n*Refine with additional requirements or deploy.*`;
				} catch (err) {
					// Fallback static skeleton
					const code = `// Algorand Smart Contract (TEAL)\n// Description: ${contractQuery || 'basic utility'}\n// Generated by Aether AI (fallback)\n\n#pragma version 8\n\n// Global state keys\nbyte "Admin"\naddr YOUR_ADMIN_ADDRESS_HERE\n==\n\n// Basic no-op always accept (placeholder)\nint 1`;
					setContractDraft(code);
					return `**🛠 Contract Generated (Fallback)**\n\n**Description:** ${contractQuery}\n\n\`\`\`teal\n${code}\n\`\`\`\n\n*Refine with more details for AI generation.*`;
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
					const aiResponseText = await askAI(userMessage.text, walletAddress);

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

						{/* Agent Commands Dropdown */}
						{showAgentCommands && selectedMode === 'Agent' && (
							<div className="agent-commands">
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
