/**
 * Dify API Wrapper - Main Index
 * Root endpoint with API documentation
 */

const allowCors = (fn) => async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    return await fn(req, res);
};

const handler = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method not allowed',
            message: 'This endpoint only accepts GET requests'
        });
    }

    const baseUrl = `https://${req.headers.host}`;

    return res.status(200).json({
        name: 'Dify API Wrapper',
        version: '1.0.0',
        description: 'A wrapper API for Dify chatbot services, deployed on Vercel',
        documentation: {
            endpoints: {
                chat: {
                    url: `${baseUrl}/api/chat`,
                    method: 'POST',
                    description: 'Send chat messages to Dify chatbot',
                    parameters: {
                        message: 'string (required) - The message to send',
                        conversation_id: 'string (optional) - Conversation ID for context',
                        user_id: 'string (optional) - User identifier (default: "default-user")'
                    },
                    example: {
                        request: {
                            message: 'Hello, how are you?',
                            conversation_id: '1c7e55fb-1ba2-4e10-81b5-30addcea2276',
                            user_id: 'user123'
                        },
                        response: {
                            success: true,
                            data: {
                                message: 'Hello! I\'m doing well, thank you for asking.',
                                conversation_id: '1c7e55fb-1ba2-4e10-81b5-30addcea2276',
                                message_id: 'msg-abc123',
                                created_at: 1704067200,
                                metadata: {
                                    model: 'gpt-3.5-turbo',
                                    tokens: 25
                                }
                            }
                        }
                    }
                },
                completion: {
                    url: `${baseUrl}/api/completion`,
                    method: 'POST',
                    description: 'Generate text completions using Dify',
                    parameters: {
                        inputs: 'object (required) - Input variables for the completion',
                        user_id: 'string (optional) - User identifier (default: "default-user")',
                        response_mode: 'string (optional) - "blocking" or "streaming" (default: "blocking")'
                    },
                    example: {
                        request: {
                            inputs: { text: 'Write a short story about AI' },
                            user_id: 'user123',
                            response_mode: 'blocking'
                        },
                        response: {
                            success: true,
                            data: {
                                message: 'Once upon a time, in a world where artificial intelligence...',
                                message_id: 'msg-xyz789',
                                created_at: 1704067200,
                                metadata: {
                                    model: 'gpt-4',
                                    tokens: 150
                                }
                            }
                        }
                    }
                },
                health: {
                    url: `${baseUrl}/api/health`,
                    method: 'GET',
                    description: 'Check API health and configuration status',
                    example: {
                        response: {
                            status: 'healthy',
                            timestamp: '2024-01-01T12:00:00.000Z',
                            version: '1.0.0',
                            endpoints: {
                                chat: '/api/chat',
                                completion: '/api/completion',
                                health: '/api/health'
                            },
                            configuration: {
                                dify_base_url: 'https://api.dify.ai',
                                api_key_configured: true,
                                node_version: 'v18.17.0',
                                environment: 'production'
                            }
                        }
                    }
                }
            }
        },
        links: {
            github: 'https://github.com/yourusername/dify-api-wrapper',
            dify_docs: 'https://docs.dify.ai/guides/application-publishing/developing-with-apis'
        }
    });
};

module.exports = allowCors(handler);
