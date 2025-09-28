import { useState } from 'react';
import ConnectScreen from './components/ConnectScreen';
import ChatScreen from './components/ChatScreen';
import PremiumPage from './components/PremiumPage';
import './App.css';

function App() {
	const [isConnected, setIsConnected] = useState(false);
	const [currentView, setCurrentView] = useState<'chat' | 'premium'>('chat');

	const handleConnect = () => {
		setIsConnected(true);
	};

	const showPremium = () => {
		setCurrentView('premium');
	};

	const showChat = () => {
		setCurrentView('chat');
	};

	return (
		<div className="App">
			{!isConnected ? (
				<ConnectScreen onConnect={handleConnect} />
			) : currentView === 'premium' ? (
				<PremiumPage onBack={showChat} />
			) : (
				<ChatScreen onShowPremium={showPremium} />
			)}
		</div>
	);
}

export default App;
