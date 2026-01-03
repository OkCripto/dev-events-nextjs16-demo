import { NextRequest, NextResponse } from "next/server";

import dbConnect from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";

// Type for route parameters
interface RouteParams {
    params: Promise<{ slug: string }>;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 */
export async function GET(
    req: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        // Await params to get the slug value
        const { slug } = await params;

        // Validate slug parameter
        if (!slug || typeof slug !== "string") {
            return NextResponse.json(
                { message: "Invalid or missing slug parameter" },
                { status: 400 }
            );
        }

        // Sanitize and validate slug format (lowercase alphanumeric with hyphens)
        const sanitizedSlug = slug.trim().toLowerCase();
        if (!/^[a-z0-9-]+$/.test(sanitizedSlug)) {
            return NextResponse.json(
                {
                    message:
                        "Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens",
                },
                { status: 400 }
            );
        }

        // Connect to database
        await dbConnect();

        // Query event by slug
        const event: IEvent | null = await Event.findOne({
            slug: sanitizedSlug,
        }).lean<IEvent>();

        // Handle event not found
        if (!event) {
            return NextResponse.json(
                { message: `Event with slug "${sanitizedSlug}" not found` },
                { status: 404 }
            );
        }

        // Return successful response
        return NextResponse.json(
            {
                message: "Event fetched successfully",
                event,
            },
            { status: 200 }
        );
    } catch (error) {
        // Log error for debugging (consider using proper logging service in production)
        console.error("Error fetching event by slug:", error);

        // Return generic error response
        return NextResponse.json(
            {
                message: "Failed to fetch event",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
