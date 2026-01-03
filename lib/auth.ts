import { NextRequest, NextResponse } from "next/server";

/**
 * Validates API key from request headers
 * Checks against environment variable API_SECRET_KEY
 */
export function validateApiKey(req: NextRequest): boolean {
    const apiKey = req.headers.get("x-api-key");
    const validApiKey = process.env.API_SECRET_KEY;

    if (!validApiKey) {
        console.error("⚠️ API_SECRET_KEY not configured in environment variables");
        return false;
    }

    return apiKey === validApiKey;
}

/**
 * Middleware to protect API routes
 * Returns 401 if API key is invalid or missing
 */
export function requireApiKey(req: NextRequest): NextResponse | null {
    if (!validateApiKey(req)) {
        return NextResponse.json(
            {
                error: "Unauthorized",
                message: "Valid API key required. Please include 'x-api-key' header.",
            },
            { status: 401 }
        );
    }
    return null;
}

/**
 * Rate limiting using in-memory store (basic implementation)
 * For production, consider using Redis or Upstash
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    // Clean up expired entries
    if (record && now > record.resetTime) {
        rateLimitStore.delete(identifier);
    }

    const current = rateLimitStore.get(identifier);

    if (!current) {
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs,
        });
        return { allowed: true, remaining: maxRequests - 1 };
    }

    if (current.count >= maxRequests) {
        return { allowed: false, remaining: 0 };
    }

    current.count++;
    return { allowed: true, remaining: maxRequests - current.count };
}

/**
 * Sanitize input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
        .trim()
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
        .replace(/on\w+="[^"]*"/gi, '') // Remove inline event handlers
        .substring(0, 10000); // Limit length to prevent DoS
}

/**
 * Validate event data structure
 */
export function validateEventData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    const requiredFields = ['title', 'description', 'date', 'time', 'location'];
    for (const field of requiredFields) {
        if (!data[field] || typeof data[field] !== 'string') {
            errors.push(`Missing or invalid field: ${field}`);
        }
    }

    // Validate field lengths
    if (data.title && data.title.length > 200) {
        errors.push('Title must be less than 200 characters');
    }

    if (data.description && data.description.length > 5000) {
        errors.push('Description must be less than 5000 characters');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
