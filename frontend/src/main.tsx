/*
 * Browser Polyfills for Web3 SDKs
 * 
 * These polyfills are required for Pera Wallet and Tinyman SDKs
 * to work properly in the browser environment.
 */
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;
import process from 'process';
(window as any).process = process;

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)
