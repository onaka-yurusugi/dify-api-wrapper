/**
 * Dify Chat API Wrapper
 * Handles chat messages with conversation management
 */

import {
    VercelRequest,
    VercelResponse,
    DifyChatRequest,
    DifyChatResponse,
    ChatResponseData,
    ApiResponse,
    CorsHandler,
} from "../types";

const allowCors: CorsHandler =
    (fn) => async (req: VercelRequest, res: VercelResponse) => {
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET,OPTIONS,PATCH,DELETE,POST,PUT"
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
        );

        if (req.method === "OPTIONS") {
            res.status(200).end();
            return;
        }

        return await fn(req, res);
    };

const handler = async (
    req: VercelRequest,
    res: VercelResponse
): Promise<void> => {
    // Only allow POST requests
    if (req.method !== "POST") {
        res.status(405).json({
            error: "Method not allowed",
            message: "This endpoint only accepts POST requests",
        });
        return;
    }

    try {
        const {
            message,
            conversation_id,
            user_id = "default-user",
        }: DifyChatRequest = req.body;

        // Validate required parameters
        if (!message) {
            res.status(400).json({
                error: "Bad request",
                message: "Message is required",
            });
            return;
        }

        // Get environment variables
        const DIFY_API_KEY: string | undefined = process.env.DIFY_API_KEY;
        const DIFY_BASE_URL: string =
            process.env.DIFY_BASE_URL || "https://api.dify.ai";

        if (!DIFY_API_KEY) {
            res.status(500).json({
                error: "Server configuration error",
                message: "DIFY_API_KEY is not configured",
            });
            return;
        }

        // Prepare request payload
        const payload: any = {
            inputs: {},
            query: message,
            response_mode: "blocking", // or "streaming" if you prefer
            user: user_id,
        };

        // Add conversation_id if provided
        if (conversation_id) {
            payload.conversation_id = conversation_id;
        }

        // Make request to Dify API
        const difyResponse = await fetch(`${DIFY_BASE_URL}/v1/chat-messages`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${DIFY_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!difyResponse.ok) {
            const errorData = await difyResponse.text();
            console.error("Dify API Error:", errorData);
            res.status(difyResponse.status).json({
                error: "Dify API error",
                message: `Request failed with status ${difyResponse.status}`,
                details: errorData,
            });
            return;
        }

        const data: DifyChatResponse = await difyResponse.json();

        // Return the response
        const responseData: ChatResponseData = {
            message: data.answer,
            conversation_id: data.conversation_id,
            message_id: data.message_id,
            created_at: data.created_at,
            metadata: {
                model: data.metadata?.usage?.model || "unknown",
                tokens: data.metadata?.usage?.total_tokens || 0,
            },
        };

        const response: ApiResponse<ChatResponseData> = {
            success: true,
            data: responseData,
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error("API Error:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message,
        });
    }
};

export default allowCors(handler);
