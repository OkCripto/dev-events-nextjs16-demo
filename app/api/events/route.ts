import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import dbConnect from "@/lib/mongodb";
import Event from "@/database/event.model";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const formData = await req.formData();

        const file = formData.get("image") as File;

        if (!file || file.size === 0) {
            return NextResponse.json(
                { message: "Image file is required" },
                { status: 400 }
            );

        }

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        const event = Object.fromEntries(formData.entries());
        delete event.image; // remove File object before saving

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
            { status: 201 }
        );

    } catch (e) {
        console.error(e);
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

        return NextResponse.json({message:'Event Fetched Successfully', events}, {status:200});
    } catch (e) {
        return NextResponse.json({message: "Event Fetching Failed", error: e}, {status:500});
    }
}

