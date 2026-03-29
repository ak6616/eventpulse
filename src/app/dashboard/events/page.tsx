"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

interface OrganizerEvent {
  id: string;
  title: string;
  slug: string;
  status: string;
  startTime: string;
  endTime: string;
  location: string | null;
  capacity: number;
  ticketsSold: number;
}

export default function DashboardEventsPage() {
  const { accessToken } = useAuth();
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    api<{ events: OrganizerEvent[] }>("/api/organizer/events", { token: accessToken })
      .then((data) => setEvents(data.events))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Events</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage your events and track sales</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> New Event
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-200" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 p-12 text-center">
          <p className="text-sm text-zinc-500">You haven&apos;t created any events yet.</p>
          <Link
            href="/dashboard/events/new"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-600">Event</th>
                <th className="hidden px-4 py-3 font-medium text-zinc-600 sm:table-cell">Date</th>
                <th className="px-4 py-3 font-medium text-zinc-600">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-600 text-right">Sold</th>
                <th className="px-4 py-3 font-medium text-zinc-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900">{event.title}</div>
                    {event.location && (
                      <div className="text-xs text-zinc-400">{event.location}</div>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-zinc-500 sm:table-cell">
                    {formatDate(event.startTime)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        event.status === "published"
                          ? "bg-green-50 text-green-700"
                          : event.status === "draft"
                          ? "bg-zinc-100 text-zinc-600"
                          : event.status === "cancelled"
                          ? "bg-red-50 text-red-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-500">
                    {event.ticketsSold} / {event.capacity}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
