const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

// 環境変数を読み込み
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// APIハンドラーの動的読み込み
async function loadApiHandler(apiPath) {
    try {
        // TypeScriptファイルを直接require（ts-nodeが必要）
        const modulePath = path.join(__dirname, '..', 'api', `${apiPath}.ts`);

        // Node.jsの場合、JSファイルから読み込み
        const jsModulePath = path.join(__dirname, '..', 'api', `${apiPath}.js`);

        let handler;
        if (fs.existsSync(jsModulePath)) {
            // コンパイル済みJSファイルがある場合
            delete require.cache[require.resolve(jsModulePath)];
            handler = require(jsModulePath).default;
        } else if (fs.existsSync(modulePath)) {
            // TypeScriptファイルを直接実行（開発時）
            try {
                require('ts-node/register');
                delete require.cache[require.resolve(modulePath)];
                handler = require(modulePath).default;
            } catch (tsError) {
                console.warn('ts-node not available, building TypeScript first...');
                return null;
            }
        } else {
            return null;
        }

        return handler;
    } catch (error) {
        console.error(`Error loading API handler for ${apiPath}:`, error);
        return null;
    }
}

// サーバー作成
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

    // APIルート処理
    if (pathname.startsWith('/api/')) {
        const apiPath = pathname.replace('/api/', '');

        try {
            const handler = await loadApiHandler(apiPath);

            if (handler) {
                // リクエストボディを読み込み
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                req.on('end', async () => {
                    try {
                        // Vercel Request/Response オブジェクトを模擬
                        const mockReq = {
                            method: req.method,
                            headers: req.headers,
                            query: parsedUrl.query,
                            body: body ? JSON.parse(body) : undefined,
                            url: req.url
                        };

                        const mockRes = {
                            statusCode: 200,
                            headers: {},
                            body: null,
                            status: function (code) {
                                this.statusCode = code;
                                return this;
                            },
                            json: function (data) {
                                this.body = JSON.stringify(data);
                                return this;
                            },
                            setHeader: function (name, value) {
                                this.headers[name] = value;
                                return this;
                            },
                            end: function () {
                                // 実際のレスポンスに書き込み
                                res.writeHead(this.statusCode, {
                                    'Content-Type': 'application/json',
                                    ...this.headers
                                });
                                res.end(this.body || '');
                            }
                        };

                        // APIハンドラーを実行
                        await handler(mockReq, mockRes);

                        // レスポンスを送信
                        if (!res.headersSent) {
                            res.writeHead(mockRes.statusCode, {
                                'Content-Type': 'application/json',
                                ...mockRes.headers
                            });
                            res.end(mockRes.body || '');
                        }

                    } catch (error) {
                        console.error('API Error:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: 'Internal server error',
                            message: error.message
                        }));
                    }
                });
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Not found',
                    message: `API endpoint ${pathname} not found`
                }));
            }
        } catch (error) {
            console.error('API Loading Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Server error',
                message: 'Failed to load API handler'
            }));
        }
        return;
    }

    // 静的ファイルの処理
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, '..', 'public', filePath);

    // ファイルの存在確認
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // ファイルが見つからない場合、index.htmlにリダイレクト（SPA対応）
            if (pathname !== '/') {
                filePath = path.join(__dirname, '..', 'public', 'index.html');
            }
        }

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
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
                } else {
                    res.writeHead(500);
                    res.end(`Server Error: ${error.code}`);
                }
            } else {
                const extname = String(path.extname(filePath)).toLowerCase();
                const mimeType = mimeTypes[extname] || 'application/octet-stream';

                res.writeHead(200, { 'Content-Type': mimeType });
                res.end(content, 'utf-8');
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Development server running at http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/`);
    console.log(`🧪 Test Chat API: http://localhost:${PORT}/test-chat.html`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down development server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

module.exports = server;
