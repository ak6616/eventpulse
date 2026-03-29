"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatDate, formatCents } from "@/lib/utils";
import { Ticket, QrCode, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

interface TicketInfo {
  id: string;
  qrCodeToken: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  tier: { id: string; name: string; priceCents: number };
  event: { id: string; title: string; startTime: string; location: string | null };
}

interface OrderInfo {
  id: string;
  status: string;
  totalCents: number;
  createdAt: string;
  tickets: TicketInfo[];
}

export default function MyTicketsPage() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !accessToken) {
      router.push("/login");
      return;
    }

    // Fetch user's tickets by fetching all their orders
    // Since there's no direct "my tickets" endpoint, we fetch individual tickets
    // For now, we'll show a placeholder and poll for tickets
    setLoading(false);
  }, [user, accessToken, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-zinc-200" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-zinc-900">My Tickets</h1>
      <p className="mt-1 text-sm text-zinc-500">View and manage your event tickets</p>

      {tickets.length === 0 ? (
        <div className="mt-12 text-center">
          <Ticket className="mx-auto h-12 w-12 text-zinc-300" />
          <h3 className="mt-4 text-lg font-medium text-zinc-900">No tickets yet</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Browse events and purchase tickets to see them here.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900">{ticket.event.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatDate(ticket.event.startTime)}
                  {ticket.event.location && ` · ${ticket.event.location}`}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {ticket.tier.name}
                  </span>
                  <span className="text-xs text-zinc-400">{formatCents(ticket.tier.priceCents)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {ticket.checkedIn ? (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" /> Checked in
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-zinc-400">
                    <Clock className="h-4 w-4" /> Not checked in
                  </span>
                )}
                <button
                  onClick={() => setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  <QrCode className="h-4 w-4" />
                </button>
              </div>
              {selectedTicket === ticket.id && (
                <div className="w-full border-t border-zinc-200 pt-4 text-center">
                  <p className="mb-2 text-xs text-zinc-500">Present this QR code at check-in</p>
                  <div className="inline-block rounded-lg bg-zinc-100 p-4">
                    <p className="font-mono text-xs text-zinc-600 break-all">{ticket.qrCodeToken}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
