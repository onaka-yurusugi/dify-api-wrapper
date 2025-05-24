import { IncomingMessage, ServerResponse } from "http";

// Dify API Types
export interface DifyChatRequest {
    message: string;
    conversation_id?: string;
    user_id?: string;
}

export interface DifyCompletionRequest {
    inputs: Record<string, any>;
    user_id?: string;
    response_mode?: "blocking" | "streaming";
}

export interface DifyChatResponse {
    answer: string;
    conversation_id: string;
    message_id: string;
    created_at: number;
    metadata?: {
        usage?: {
            model?: string;
            total_tokens?: number;
        };
    };
}

export interface DifyCompletionResponse {
    answer: string;
    message_id: string;
    created_at: number;
    metadata?: {
        usage?: {
            model?: string;
            total_tokens?: number;
        };
    };
}

// API Response Types
export interface ApiSuccessResponse<T = any> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success?: false;
    error: string;
    message: string;
    details?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Chat API Response Data
export interface ChatResponseData {
    message: string;
    conversation_id: string;
    message_id: string;
    created_at: number;
    metadata: {
        model: string;
        tokens: number;
    };
}

// Completion API Response Data
export interface CompletionResponseData {
    message: string;
    message_id: string;
    created_at: number;
    metadata: {
        model: string;
        tokens: number;
    };
}

// Health Check Response
export interface HealthCheckResponse {
    status: "healthy" | "unhealthy";
    timestamp: string;
    version: string;
    endpoints: {
        chat: string;
        completion: string;
        health: string;
    };
    configuration: {
        dify_base_url: string;
        api_key_configured: boolean;
        node_version: string;
        environment: string;
    };
}

// Vercel Request/Response types
export interface VercelRequest {
    body: any;
    method?: string;
    query?: any;
    headers: Record<string, string | undefined>;
}

export interface VercelResponse {
    status(code: number): VercelResponse;
    json(body: any): VercelResponse;
    setHeader(name: string, value: string): VercelResponse;
    end(): void;
}

// CORS Handler Type
export type CorsHandler = (
    fn: (req: VercelRequest, res: VercelResponse) => Promise<void>
) => (req: VercelRequest, res: VercelResponse) => Promise<void>;
