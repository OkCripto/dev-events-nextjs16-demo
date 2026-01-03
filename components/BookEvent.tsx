'use client'

import {useState} from "react";
import {createBooking} from "@/lib/actions/booking.actions";
import posthog from "posthog-js";

const BookEvent = ({eventId, slug}:{eventId: string, slug: string}) => {

    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        const { success, error: bookingError } = await createBooking({ eventId, slug, email });

        setLoading(false);

        if (success) {
            setSubmitted(true);
            posthog.capture('event_booked', { eventId, slug, email });
        } else {
            const errorMsg = bookingError || 'Booking failed. Please try again.';
            setError(errorMsg);
            console.error('Booking Creation Failed:', errorMsg);
            posthog.capture('booking_failed', { eventId, slug, email, error: errorMsg });
        }
    }
    
    return (
        <div id='book-event'>
            {submitted ? (
                <p className='text-sm text-green-600'>Thank You for Signing Up!</p>
            ): (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='email'>Email Address</label>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id='email'
                            placeholder='Enter Your Email Address'
                            required
                            disabled={loading}
                        />
                        {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
                    </div>

                    <button type='submit' className='button-submit' disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            )}
        </div>
    )
}
export default BookEvent
