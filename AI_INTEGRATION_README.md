# Aether AI - Google Gemini Integration

This project now includes Google Gemini AI integration for answering Algorand and Web3-related questions.

## 🤖 AI Features

- **Algorand-Focused AI**: Specialized responses for Algorand blockchain questions
- **Real-time Chat**: Interactive chat interface with AI responses
- **Wallet Integration**: AI knows your wallet address (when connected)
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Visual feedback during AI processing

## 🛠️ Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # This will install @google/generative-ai and other dependencies
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   # Google Gemini Configuration
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash-exp
   ```

4. **Get your Gemini API key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env` file

5. **Start backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update environment variables:**
   The frontend `.env` already includes the Gemini API key. Make sure it matches your backend configuration.

4. **Start frontend development server:**
   ```bash
   npm run dev
   ```

## 🚀 Testing the AI Integration

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### 2. Test AI Functionality

1. **Open the application**: `http://localhost:5173`
2. **Connect your Pera Wallet** (optional - works without wallet too)
3. **Ask Algorand-related questions** such as:
   - "What is Algorand?"
   - "How do I create an ASA?"
   - "What is Pure Proof of Stake?"
   - "How does Algorand consensus work?"
   - "What are Algorand Smart Contracts?"

### 3. Expected Behavior

- **Algorand Questions**: Get detailed, accurate responses about Algorand
- **Non-Algorand Questions**: Get redirected to ask Algorand-specific questions
- **Loading States**: See "Aether is thinking..." while AI processes
- **Error Handling**: Clear error messages if something goes wrong

## 🔧 API Endpoints

### POST /ai/ask
Ask the AI a question about Algorand.

**Request Body:**
```json
{
  "question": "What is Algorand?",
  "walletAddress": "optional_wallet_address"
}
```

**Response:**
```json
{
  "response": "Algorand is a blockchain platform...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**
```json
{
  "error": "Failed to generate AI response",
  "details": "API key not configured"
}
```

## 📁 New Files Created

- `backend/src/geminiClient.ts` - Google Gemini AI integration
- `frontend/src/services/aiService.ts` - Frontend AI service
- `frontend/src/vite-env.d.ts` - TypeScript environment definitions

## 🔍 How It Works

1. **User asks a question** in the chat interface
2. **Frontend sends request** to `/ai/ask` endpoint
3. **Backend validates** if question is Algorand-related
4. **Gemini AI processes** the question with Algorand context
5. **Response is sent back** to the frontend
6. **Chat interface displays** the AI response

## 🛡️ Security & Best Practices

- ✅ API key stored in environment variables (not in code)
- ✅ CORS configured for frontend-backend communication
- ✅ Input validation on both frontend and backend
- ✅ Error handling with user-friendly messages
- ✅ Request timeout (30 seconds) to prevent hanging
- ✅ Loading states for better UX

## 🎯 AI Model Configuration

- **Model**: `gemini-2.0-flash-exp` (Free tier)
- **Focus**: Algorand blockchain and Web3 topics
- **Filtering**: Non-Algorand questions are redirected
- **Context**: AI has knowledge of user's wallet address when connected

## 🔄 Development Workflow

1. **Make changes** to AI logic in `backend/src/geminiClient.ts`
2. **Test with curl**:
   ```bash
   curl -X POST http://localhost:4000/ai/ask \
     -H "Content-Type: application/json" \
     -d '{"question": "What is Algorand?"}'
   ```
3. **Test in UI** through the chat interface
4. **Monitor logs** in backend console for debugging

## 🐛 Troubleshooting

### Backend not responding
- Check if `@google/generative-ai` is installed
- Verify GEMINI_API_KEY in `.env` file
- Check backend console for errors

### Frontend can't reach backend
- Ensure backend is running on port 4000
- Check VITE_API_URL in frontend `.env`
- Verify CORS configuration

### AI responses are generic
- Check if questions are Algorand-related
- Review keyword filtering in `geminiClient.ts`
- Verify AI model is receiving proper context

## 🎉 Success Criteria

- ✅ AI responds to Algorand questions with accurate information
- ✅ Loading states show during AI processing
- ✅ Error handling works for network/API issues  
- ✅ Wallet integration passes address to AI context
- ✅ Non-Algorand questions are handled appropriately
- ✅ UI remains responsive during AI interactions

Your Aether AI Web3 interface now has full Google Gemini AI integration! 🚀
