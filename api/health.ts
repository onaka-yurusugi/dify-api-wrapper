/**
 * Health Check Endpoint
 * Returns API status and configuration
 */

import {
    VercelRequest,
    VercelResponse,
    HealthCheckResponse,
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
    // Only allow GET requests
    if (req.method !== "GET") {
        res.status(405).json({
            error: "Method not allowed",
            message: "This endpoint only accepts GET requests",
        });
        return;
    }

    try {
        const DIFY_API_KEY: string | undefined = process.env.DIFY_API_KEY;
        const DIFY_BASE_URL: string =
            process.env.DIFY_BASE_URL || "https://api.dify.ai";

        const response: HealthCheckResponse = {
            status: "healthy",
            timestamp: new Date().toISOString(),
            version: "1.0.0",
            endpoints: {
                chat: "/api/chat",
                completion: "/api/completion",
                health: "/api/health",
            },
            configuration: {
                dify_base_url: DIFY_BASE_URL,
                api_key_configured: !!DIFY_API_KEY,
                node_version: process.version,
                environment: process.env.NODE_ENV || "development",
            },
        };

        res.status(200).json(response);
    } catch (error: any) {
        console.error("Health Check Error:", error);
        res.status(500).json({
            status: "unhealthy",
            error: "Internal server error",
            message: error.message,
        });
    }
};

export default allowCors(handler);
