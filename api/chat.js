/**
 * Dify Chat API Wrapper
 * Handles chat messages with conversation management
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
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            message: 'This endpoint only accepts POST requests'
        });
    }

    try {
        const { message, conversation_id, user_id = 'default-user' } = req.body;

        // Validate required parameters
        if (!message) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Message is required'
            });
        }

        // Get environment variables
        const DIFY_API_KEY = process.env.DIFY_API_KEY;
        const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai';

        if (!DIFY_API_KEY) {
            return res.status(500).json({
                error: 'Server configuration error',
                message: 'DIFY_API_KEY is not configured'
            });
        }

        // Prepare request payload
        const payload = {
            inputs: {},
            query: message,
            response_mode: "blocking", // or "streaming" if you prefer
            user: user_id
        };

        // Add conversation_id if provided
        if (conversation_id) {
            payload.conversation_id = conversation_id;
        }

        // Make request to Dify API
        const difyResponse = await fetch(`${DIFY_BASE_URL}/v1/chat-messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!difyResponse.ok) {
            const errorData = await difyResponse.text();
            console.error('Dify API Error:', errorData);
            return res.status(difyResponse.status).json({
                error: 'Dify API error',
                message: `Request failed with status ${difyResponse.status}`,
                details: errorData
            });
        }

        const data = await difyResponse.json();

        // Return the response
        return res.status(200).json({
            success: true,
            data: {
                message: data.answer,
                conversation_id: data.conversation_id,
                message_id: data.message_id,
                created_at: data.created_at,
                metadata: {
                    model: data.metadata?.usage?.model || 'unknown',
                    tokens: data.metadata?.usage?.total_tokens || 0
                }
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

module.exports = allowCors(handler);
