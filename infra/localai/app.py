from flask import Flask, jsonify
import os
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        'service': 'LocalAI',
        'status': 'running',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/models')
def models():
    # Placeholder for AI model endpoints
    return jsonify({
        'models': [
            {'name': 'gpt-3.5-turbo', 'status': 'available'},
            {'name': 'claude-3-sonnet', 'status': 'available'}
        ]
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
