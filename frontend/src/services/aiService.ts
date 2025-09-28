import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_URL as string || 'http://localhost:4000';

interface AiResponse {
	response: string;
	timestamp: string;
}

interface AiError {
	error: string;
	details?: string;
}

export const askAI = async (question: string, walletAddress?: string): Promise<string> => {
	try {
		console.log('🤖 Sending question to AI:', question);

		const response = await axios.post<AiResponse>(`${API_BASE_URL}/ai/ask`, {
			question,
			walletAddress
		}, {
			headers: {
				'Content-Type': 'application/json'
			},
			timeout: 30000 // 30 second timeout
		});

		console.log('✅ AI Response received:', response.data.response);
		return response.data.response;

	} catch (error) {
		console.error('❌ AI Service Error:', error);

		if (axios.isAxiosError(error)) {
			if (error.response) {
				console.error('Server response error:', error.response.status, error.response.data);
				const errorData = error.response.data as AiError;
				throw new Error(errorData.details || errorData.error || 'Server error occurred');
			} else if (error.request) {
				console.error('Network error:', error.message);
				throw new Error('Network error - please check your connection and ensure the backend server is running.');
			} else {
				console.error('Axios configuration error:', error.message);
			}
		}

		throw new Error('Failed to get AI response. An unknown error occurred.');
	}
};

export default {
	askAI
};
