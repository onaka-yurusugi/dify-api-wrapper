// Vercel Runtime Globals
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DIFY_API_KEY: string | undefined;
            DIFY_BASE_URL?: string;
            NODE_ENV?: string;
        }
    }

    var process: {
        env: NodeJS.ProcessEnv;
        version: string;
    };

    var console: {
        log: (...args: any[]) => void;
        error: (...args: any[]) => void;
        warn: (...args: any[]) => void;
        info: (...args: any[]) => void;
    };

    function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

export {};
