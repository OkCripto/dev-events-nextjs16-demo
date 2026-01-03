import React from 'react'
import { notFound } from "next/navigation";
import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import EventCard from "@/components/EventCard";
import BookEvent from "@/components/BookEvent";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL?.startsWith('http')
    ? process.env.NEXT_PUBLIC_BASE_URL
    : `https://${process.env.NEXT_PUBLIC_BASE_URL}`;

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map(item => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map(tag => (
            <div className="pill" key={tag}>{tag}</div>
        ))}
    </div>
);

const EventDetails = async ({ params }: { params: Promise<string> }) => {

    'use cache'
    cacheLife('hours')
    const slug = await params;

    const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
        cache: 'force-cache',
        next: { revalidate: 3600 }, // Revalidate every hour
    });

    // Check response status
    if (!request.ok) {
        if (request.status === 404) {
            return notFound();
        }
        // Log other errors and return not found
        console.error(`Failed to fetch event: ${request.status} ${request.statusText}`);
        return notFound();
    }

    // Parse JSON response
    const json = await request.json();

    // Validate response shape
    if (!json.event) {
        console.error("Invalid API response: missing event data");
        return notFound();
    }

    const {
        event: {
            _id: eventId,
            description,
            image,
            overview,
            date,
            time,
            location,
            mode,
            agenda,
            audience,
            tags,
            organizer,
        },
    } = json;

    // Validate required fields
    if (!description) return notFound();

    const bookings = 10;
    const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p>{description}</p>
            </div>

            <div className="details">
                <div className="content">

                    {/* FIXED BANNER (proper size) */}
                    <div className="relative w-full aspect-[16/9] mb-6">
                        <Image
                            src={image}
                            alt="Event Banner"
                            fill
                            className="object-cover rounded-xl"
                            priority
                        />
                    </div>

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                    </section>

                    <EventAgenda agendaItems={agenda} />

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={tags} />

                    {/*  INTENTIONAL GAP AFTER TAGS */}
                    <div className="mt-16">
                        <h2 className="mb-6">Similar Events</h2>

                        <div className="max-w-3xl">
                            <div className="flex flex-col gap-6">
                                {similarEvents.map(event => (
                                    <EventCard
                                        key={event.slug}
                                        title={event.title}
                                        image={event.image}
                                        date={event.date}
                                        time={event.time}
                                        location={event.location}
                                        slug={event.slug}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">
                                Join {bookings} People who have Already Booked Their Spot!
                            </p>
                        ) : (
                            <p className="text-sm">Be the First to Book Your Spot</p>
                        )}
                        <BookEvent eventId={eventId} slug={slug} />
                    </div>
                </aside>
            </div>
        </section>
    );
}
export default EventDetails
