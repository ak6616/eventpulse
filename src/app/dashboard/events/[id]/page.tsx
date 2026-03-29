"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { formatCents, formatDate } from "@/lib/utils";
import { ArrowLeft, Users, DollarSign, Ticket, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface EventStats {
  event: {
    id: string;
    title: string;
    capacity: number;
    ticketsSold: number;
    status: string;
  };
  ticketTiers: Array<{
    id: string;
    name: string;
    priceCents: number;
    capacity: number;
    sold: number;
  }>;
  totalRevenueCents: number;
  checkedInCount: number;
}

interface Attendee {
  ticketId: string;
  attendeeName: string;
  attendeeEmail: string;
  tierName: string;
  orderId: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  purchasedAt: string;
}

export default function EventManagePage() {
  const params = useParams();
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<EventStats | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"stats" | "attendees">("stats");

  useEffect(() => {
    if (!accessToken) return;
    const id = params.id as string;

    Promise.all([
      api<EventStats>(`/api/organizer/events/${id}/stats`, { token: accessToken }),
      api<{ attendees: Attendee[] }>(`/api/organizer/events/${id}/attendees`, { token: accessToken }),
    ])
      .then(([statsData, attendeesData]) => {
        setStats(statsData);
        setAttendees(attendeesData.attendees);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id, accessToken]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-zinc-200" />
        <div className="h-64 rounded-xl bg-zinc-200" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Event not found or access denied.</p>
        <Link href="/dashboard/events" className="mt-4 inline-block text-sm font-medium text-indigo-600">
          Back to events
        </Link>
      </div>
    );
  }

  const { event, ticketTiers, totalRevenueCents, checkedInCount } = stats;

  return (
    <div>
      <Link href="/dashboard/events" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{event.title}</h1>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              event.status === "published"
                ? "bg-green-50 text-green-700"
                : event.status === "draft"
                ? "bg-zinc-100 text-zinc-600"
                : "bg-red-50 text-red-700"
            }`}
          >
            {event.status}
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Revenue</span>
          </div>
          <p className="mt-1 text-xl font-bold text-zinc-900">{formatCents(totalRevenueCents)}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Ticket className="h-4 w-4" />
            <span className="text-xs">Tickets Sold</span>
          </div>
          <p className="mt-1 text-xl font-bold text-zinc-900">
            {event.ticketsSold} / {event.capacity}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Users className="h-4 w-4" />
            <span className="text-xs">Checked In</span>
          </div>
          <p className="mt-1 text-xl font-bold text-zinc-900">{checkedInCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Ticket className="h-4 w-4" />
            <span className="text-xs">Tiers</span>
          </div>
          <p className="mt-1 text-xl font-bold text-zinc-900">{ticketTiers.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex border-b border-zinc-200">
        <button
          onClick={() => setTab("stats")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            tab === "stats"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Ticket Tiers
        </button>
        <button
          onClick={() => setTab("attendees")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            tab === "attendees"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Attendees ({attendees.length})
        </button>
      </div>

      {tab === "stats" ? (
        <div className="mt-4 space-y-3">
          {ticketTiers.map((tier) => (
            <div key={tier.id} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4">
              <div>
                <p className="font-medium text-zinc-900">{tier.name}</p>
                <p className="text-sm text-zinc-500">{formatCents(tier.priceCents)} per ticket</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-zinc-900">{tier.sold} / {tier.capacity}</p>
                <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${(tier.sold / tier.capacity) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          {attendees.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">No attendees yet.</div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-600">Name</th>
                    <th className="hidden px-4 py-3 font-medium text-zinc-600 sm:table-cell">Email</th>
                    <th className="px-4 py-3 font-medium text-zinc-600">Tier</th>
                    <th className="px-4 py-3 font-medium text-zinc-600">Check-in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {attendees.map((a) => (
                    <tr key={a.ticketId}>
                      <td className="px-4 py-3 font-medium text-zinc-900">{a.attendeeName}</td>
                      <td className="hidden px-4 py-3 text-zinc-500 sm:table-cell">{a.attendeeEmail}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                          {a.tierName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {a.checkedIn ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline text-xs">{a.checkedInAt ? formatDate(a.checkedInAt) : "Yes"}</span>
                          </span>
                        ) : (
                          <XCircle className="h-4 w-4 text-zinc-300" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
