const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

let PORT = process.env.PORT || 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

// Simple mock API responses for testing
const mockApiResponses = {
    health: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: "development",
        note: "This is a mock response - please set up DIFY_API_KEY for full functionality"
    },
    chat: {
        endpoint: "/api/chat",
        method: "POST",
        description: "Send chat messages to Dify chatbot",
        note: "Set DIFY_API_KEY in .env file to enable real chat functionality",
        example_request: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: {
                message: "Hello, how are you?",
                conversation_id: "optional-conversation-id",
                user_id: "user123"
            }
        }
    }
};

// Function to find available port
function findAvailablePort(startPort, maxAttempts = 10) {
    return new Promise((resolve, reject) => {
        let currentPort = startPort;
        let attempts = 0;

        function testPort(port) {
            const server = http.createServer();

            server.listen(port, () => {
                server.close(() => {
                    resolve(port);
                });
            });

            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE' && attempts < maxAttempts) {
                    attempts++;
                    currentPort++;
                    testPort(currentPort);
                } else {
                    reject(err);
                }
            });
        }

        testPort(currentPort);
    });
}

// Create server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`${new Date().toISOString()} ${req.method} ${pathname}`);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API routes
    if (pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json');

        if (pathname === '/api/health') {
            res.writeHead(200);
            res.end(JSON.stringify(mockApiResponses.health, null, 2));
            return;
        }

        if (pathname === '/api/chat') {
            if (req.method === 'GET') {
                res.writeHead(200);
                res.end(JSON.stringify(mockApiResponses.chat, null, 2));
                return;
            } else if (req.method === 'POST') {
                // Read request body
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                req.on('end', () => {
                    try {
                        const requestData = JSON.parse(body);
                        const response = {
                            success: true,
                            data: {
                                message: `Mock response to: "${requestData.message || 'No message'}"`,
                                conversation_id: requestData.conversation_id || "mock-conversation-" + Date.now(),
                                message_id: "mock-message-" + Date.now(),
                                created_at: Math.floor(Date.now() / 1000),
                                metadata: {
                                    model: "mock-model",
                                    tokens: 10,
                                    note: "This is a mock response. Set up DIFY_API_KEY for real functionality."
                                }
                            }
                        };
                        res.writeHead(200);
                        res.end(JSON.stringify(response, null, 2));
                    } catch (error) {
                        res.writeHead(400);
                        res.end(JSON.stringify({
                            error: "Bad request",
                            message: "Invalid JSON in request body"
                        }));
                    }
                });
                return;
            }
        }

        // API not found
        res.writeHead(404);
        res.end(JSON.stringify({
            error: "Not found",
            message: `API endpoint ${pathname} not found`
        }));
        return;
    }

    // Static files
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, '..', 'public', filePath);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // 404 page
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <head><title>404 Not Found</title></head>
                    <body>
                        <h1>404 - Page Not Found</h1>
                        <p>Available pages:</p>
                        <ul>
                            <li><a href="/">API Documentation</a></li>
                            <li><a href="/test-chat.html">Chat API Test</a></li>
                            <li><a href="/api/health">Health Check</a></li>
                            <li><a href="/api/chat">Chat API Info</a></li>
                        </ul>
                    </body>
                </html>
            `);
            return;
        }

        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            } else {
                const extname = String(path.extname(filePath)).toLowerCase();
                const mimeType = mimeTypes[extname] || 'application/octet-stream';

                res.writeHead(200, { 'Content-Type': mimeType });
                res.end(content, 'utf-8');
            }
        });
    });
});

// Start server with automatic port detection
async function startServer() {
    try {
        PORT = await findAvailablePort(PORT);

        server.listen(PORT, () => {
            console.log(`🚀 Simple Development Server running at http://localhost:${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/`);
            console.log(`🧪 Test Chat API: http://localhost:${PORT}/test-chat.html`);
            console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
            console.log('');
            if (PORT !== 3000) {
                console.log(`⚠️  Port 3000 was busy, using port ${PORT} instead`);
            }
            console.log('⚠️  This is a simplified development server with mock responses.');
            console.log('💡 For full functionality, install dependencies and configure DIFY_API_KEY.');
            console.log('');
            console.log('Press Ctrl+C to stop the server');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down development server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

// Start the server
startServer();

module.exports = server;
