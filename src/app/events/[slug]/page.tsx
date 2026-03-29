"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { formatDate, formatCents } from "@/lib/utils";
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TicketTier {
  id: string;
  name: string;
  priceCents: number;
  capacity: number;
  sold: number;
  saleStart: string | null;
  saleEnd: string | null;
}

interface EventDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  ticketsSold: number;
  status: string;
  coverImageUrl: string | null;
}

interface Organizer {
  id: string;
  name: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    api<{ event: EventDetail; ticketTiers: TicketTier[]; organizer: Organizer }>(
      `/api/events/${params.slug}`
    )
      .then((data) => {
        setEvent(data.event);
        setTiers(data.ticketTiers);
        setOrganizer(data.organizer);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalCents = tiers.reduce((sum, t) => sum + (cart[t.id] || 0) * t.priceCents, 0);

  const handleOrder = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (totalItems === 0) return;

    setOrdering(true);
    setOrderError("");
    try {
      const items = Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([tierId, quantity]) => ({ tierId, quantity }));

      const data = await api<{ order: { id: string }; clientSecret: string }>(
        `/api/events/${event!.id}/orders`,
        { method: "POST", body: { items }, token: accessToken! }
      );

      router.push(`/checkout/${data.order.id}?clientSecret=${data.clientSecret}`);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-zinc-200" />
          <div className="aspect-[21/9] rounded-xl bg-zinc-200" />
          <div className="h-6 w-2/3 rounded bg-zinc-200" />
          <div className="h-4 w-full rounded bg-zinc-100" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-zinc-900">Event not found</h2>
        <p className="mt-2 text-sm text-zinc-500">{error || "This event may have been removed."}</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Back to events
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      {/* Cover image */}
      <div className="aspect-[21/9] overflow-hidden rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500">
        {event.coverImageUrl && (
          <img src={event.coverImageUrl} alt={event.title} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-zinc-900">{event.title}</h1>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-zinc-400" />
              {formatDate(event.startTime)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-zinc-400" />
              {formatDate(event.endTime)}
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-zinc-400" />
                {event.location}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-zinc-400" />
              {event.capacity - event.ticketsSold} / {event.capacity} spots available
            </div>
          </div>

          {organizer && (
            <p className="mt-3 text-sm text-zinc-500">Organized by <span className="font-medium text-zinc-700">{organizer.name}</span></p>
          )}

          {event.description && (
            <div className="mt-6 prose prose-zinc max-w-none text-zinc-600 whitespace-pre-line">
              {event.description}
            </div>
          )}
        </div>

        {/* Ticket selection sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">Tickets</h2>

            {tiers.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">No tickets available.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {tiers.map((tier) => {
                  const available = tier.capacity - tier.sold;
                  const qty = cart[tier.id] || 0;

                  return (
                    <div key={tier.id} className="rounded-lg border border-zinc-200 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-zinc-900">{tier.name}</p>
                          <p className="text-sm text-indigo-600 font-semibold">
                            {tier.priceCents === 0 ? "Free" : formatCents(tier.priceCents)}
                          </p>
                        </div>
                        {available > 0 ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setCart((c) => ({ ...c, [tier.id]: Math.max(0, qty - 1) }))
                              }
                              disabled={qty === 0}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-30"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-sm font-medium">{qty}</span>
                            <button
                              onClick={() =>
                                setCart((c) => ({
                                  ...c,
                                  [tier.id]: Math.min(available, qty + 1),
                                }))
                              }
                              disabled={qty >= available}
                              className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-red-600">Sold out</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">{available} remaining</p>
                    </div>
                  );
                })}
              </div>
            )}

            {totalItems > 0 && (
              <div className="mt-4 border-t border-zinc-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600">{totalItems} ticket{totalItems > 1 ? "s" : ""}</span>
                  <span className="font-semibold text-zinc-900">{formatCents(totalCents)}</span>
                </div>
              </div>
            )}

            {orderError && (
              <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">{orderError}</div>
            )}

            <button
              onClick={handleOrder}
              disabled={totalItems === 0 || ordering}
              className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {ordering
                ? "Processing..."
                : totalItems === 0
                ? "Select tickets"
                : user
                ? `Buy ${totalItems} ticket${totalItems > 1 ? "s" : ""}`
                : "Sign in to buy tickets"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
