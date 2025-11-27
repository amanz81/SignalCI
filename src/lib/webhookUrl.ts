/**
 * Generate the full webhook URL for a pipeline
 * Uses the new secure v1 format: /api/webhook/v1/{token}
 */
export function getWebhookUrl(token: string, baseUrl?: string): string {
    const path = `/api/webhook/v1/${token}`;
    
    if (baseUrl) {
        return `${baseUrl}${path}`;
    }
    
    // For server-side rendering, try to get from environment
    if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) {
        return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
    }
    
    // Fallback for development
    return path;
}

