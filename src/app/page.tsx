"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { EventCard } from "@/components/event-card";
import { Search, Ticket } from "lucide-react";

interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  ticketsSold: number;
  coverImageUrl: string | null;
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    api<{ events: Event[] }>(`/api/events?page=${page}&limit=12`)
      .then((data) => setEvents(data.events))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = search
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.location?.toLowerCase().includes(search.toLowerCase())
      )
    : events;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Discover Amazing Events
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
            Find and book tickets for concerts, workshops, conferences, and more.
          </p>
          <div className="mx-auto mt-8 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border-0 bg-white py-3 pl-10 pr-4 text-sm text-zinc-900 shadow-lg placeholder-zinc-400 focus:ring-2 focus:ring-white/50 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Event grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-xl font-semibold text-zinc-900">Upcoming Events</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-zinc-200 bg-white">
                <div className="aspect-[16/9] bg-zinc-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-zinc-200" />
                  <div className="h-4 w-full rounded bg-zinc-100" />
                  <div className="h-4 w-1/2 rounded bg-zinc-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-3 text-sm text-zinc-500">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={events.length < 12}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <Ticket className="mx-auto h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 text-lg font-medium text-zinc-900">No events found</h3>
            <p className="mt-1 text-sm text-zinc-500">
              {search ? "Try a different search term." : "Check back soon for upcoming events."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
