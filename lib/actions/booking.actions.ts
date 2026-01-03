'use server';

import dbConnect from "@/lib/mongodb";
import Booking from "@/database/booking.model";
import { Types } from "mongoose";

export const createBooking = async ({ eventId, slug, email}: {eventId: string; slug: string; email: string;}) => {
    try {
        await dbConnect();
        
        // Validate eventId format
        if (!Types.ObjectId.isValid(eventId)) {
            return { success: false, error: 'Invalid event ID format' };
        }

        // Create booking (only pass eventId and email, not slug)
        await Booking.create({ 
            eventId: new Types.ObjectId(eventId), 
            email 
        });

        return { success: true };
    } catch (e) {
        console.error('createBooking failed:', e);
        
        // Check for duplicate booking error
        if (e instanceof Error && e.message.includes('duplicate key')) {
            return { success: false, error: 'You have already booked this event' };
        }
        
        return { 
            success: false, 
            error: e instanceof Error ? e.message : 'Booking failed' 
        };
    }
}
