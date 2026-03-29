"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { formatCents } from "@/lib/utils";
import { Calendar, DollarSign, Users, Ticket } from "lucide-react";
import Link from "next/link";

interface EventSummary {
  id: string;
  title: string;
  slug: string;
  status: string;
  capacity: number;
  ticketsSold: number;
}

export default function DashboardOverview() {
  const { accessToken } = useAuth();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    api<{ events: EventSummary[] }>("/api/organizer/events", { token: accessToken })
      .then((data) => setEvents(data.events))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === "published").length;
  const totalTicketsSold = events.reduce((s, e) => s + e.ticketsSold, 0);
  const totalCapacity = events.reduce((s, e) => s + e.capacity, 0);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-1/3 rounded bg-zinc-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">Overview of your events and ticket sales</p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Total Events</p>
              <p className="text-2xl font-bold text-zinc-900">{totalEvents}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Published</p>
              <p className="text-2xl font-bold text-zinc-900">{publishedEvents}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <Ticket className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Tickets Sold</p>
              <p className="text-2xl font-bold text-zinc-900">{totalTicketsSold}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Total Capacity</p>
              <p className="text-2xl font-bold text-zinc-900">{totalCapacity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent events */}
      <h2 className="mt-8 text-lg font-semibold text-zinc-900">Recent Events</h2>
      {events.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-300 p-8 text-center">
          <Calendar className="mx-auto h-10 w-10 text-zinc-300" />
          <p className="mt-2 text-sm text-zinc-500">No events yet. Create your first event!</p>
          <Link
            href="/dashboard/events/new"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create Event
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {events.slice(0, 5).map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300"
            >
              <div>
                <h3 className="font-medium text-zinc-900">{event.title}</h3>
                <div className="mt-1 flex items-center gap-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      event.status === "published"
                        ? "bg-green-50 text-green-700"
                        : event.status === "draft"
                        ? "bg-zinc-100 text-zinc-600"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {event.status}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {event.ticketsSold} / {event.capacity} sold
                  </span>
                </div>
              </div>
              <div className="text-sm font-medium text-zinc-400">&rarr;</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
