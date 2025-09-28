/*
 * AI Chat Component
 * 
 * Chat interface for interacting with Aether AI.
 * Integrated with wallet for Web3-specific queries.
 */

import { useState } from 'react';
import api from '../services/api';

interface Message {
	id: string;
	content: string;
	isUser: boolean;
	timestamp: Date;
}

interface AIChatProps {
	walletAddress: string;
}

const AIChat = ({ walletAddress }: AIChatProps) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputValue.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			content: inputValue,
			isUser: true,
			timestamp: new Date(),
		};

		setMessages(prev => [...prev, userMessage]);
		setInputValue('');
		setIsLoading(true);

		try {
			// Send message to AI backend
			const response = await api.post('/ai/chat', {
				message: inputValue,
				walletAddress: walletAddress,
				context: 'web3-assistant'
			});

			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: response.data.response || 'AI response not available',
				isUser: false,
				timestamp: new Date(),
			};

			setMessages(prev => [...prev, aiMessage]);
		} catch (error) {
			console.error('AI chat error:', error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: 'Sorry, I encountered an error. Please try again.',
				isUser: false,
				timestamp: new Date(),
			};
			setMessages(prev => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="ai-chat">
			<div className="chat-header">
				<h2>Aether AI Assistant</h2>
				<p>Ask me about Web3, DeFi, Algorand, and more!</p>
			</div>

			<div className="messages-container">
				{messages.map(message => (
					<div key={message.id} className={`message ${message.isUser ? 'user' : 'ai'}`}>
						<div className="message-content">
							{message.content}
						</div>
						<div className="message-timestamp">
							{message.timestamp.toLocaleTimeString()}
						</div>
					</div>
				))}

				{isLoading && (
					<div className="message ai">
						<div className="message-content loading">
							Thinking...
						</div>
					</div>
				)}
			</div>

			<form onSubmit={handleSendMessage} className="chat-input-form">
				<input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder="Ask Aether about Web3..."
					className="chat-input"
					disabled={isLoading}
				/>
				<button type="submit" className="send-btn" disabled={isLoading || !inputValue.trim()}>
					Send
				</button>
			</form>
		</div>
	);
};

export default AIChat;
