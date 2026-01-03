import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import dbConnect from "@/lib/mongodb";
import Event from "@/database/event.model";
import { requireApiKey, checkRateLimit, sanitizeInput, validateEventData } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        // 🔐 SECURITY: Validate API Key
        const authError = requireApiKey(req);
        if (authError) return authError;

        // 🛡️ SECURITY: Rate Limiting (10 requests per minute)
        const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        const rateLimit = checkRateLimit(clientIp, 10, 60000);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: "Too Many Requests",
                    message: "Rate limit exceeded. Please try again later."
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': '10',
                        'X-RateLimit-Remaining': '0',
                    }
                }
            );
        }

        await dbConnect();

        const formData = await req.formData();

        // 🔍 SECURITY: Validate image file
        const file = formData.get("image") as File;

        if (!file || file.size === 0) {
            return NextResponse.json(
                { message: "Image file is required" },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { message: "Image file size must be less than 5MB" },
                { status: 400 }
            );
        }

        // Validate file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validImageTypes.includes(file.type)) {
            return NextResponse.json(
                { message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed" },
                { status: 400 }
            );
        }

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        const event = Object.fromEntries(formData.entries());
        delete event.image; // remove File object before saving

        // 🧹 SECURITY: Sanitize all string inputs
        Object.keys(event).forEach(key => {
            if (typeof event[key] === 'string') {
                event[key] = sanitizeInput(event[key]);
            }
        });

        // ✅ SECURITY: Validate event data structure
        const validation = validateEventData(event);
        if (!validation.valid) {
            return NextResponse.json(
                {
                    message: "Invalid event data",
                    errors: validation.errors
                },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{ secure_url: string }>(
            (resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        { resource_type: "image", folder: "DevEvent" },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result as { secure_url: string });
                        }
                    )
                    .end(buffer);
            }
        );

        event.image = uploadResult.secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json(
            { message: "Event created successfully", event: createdEvent },
            {
                status: 201,
                headers: {
                    'X-RateLimit-Limit': '10',
                    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                }
            }
        );

    } catch (e) {
        console.error("Event creation error:", e);
        return NextResponse.json(
            {
                message: "Event creation failed",
                error: e instanceof Error ? e.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await dbConnect();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Event Fetched Successfully', events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: "Event Fetching Failed", error: e }, { status: 500 });
    }
}

