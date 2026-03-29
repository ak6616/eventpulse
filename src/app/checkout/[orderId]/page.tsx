"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { formatCents } from "@/lib/utils";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface OrderDetail {
  id: string;
  status: string;
  totalCents: number;
  eventId: string;
}

interface TicketDetail {
  id: string;
  qrCodeToken: string;
  checkedIn: boolean;
}

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [tickets, setTickets] = useState<TicketDetail[]>([]);
  const [status, setStatus] = useState<"loading" | "pending" | "paid" | "failed">("loading");

  const clientSecret = searchParams.get("clientSecret");

  useEffect(() => {
    if (!user || !accessToken) {
      router.push("/login");
      return;
    }

    const checkOrder = async () => {
      try {
        const data = await api<{ order: OrderDetail; tickets: TicketDetail[] }>(
          `/api/orders/${params.orderId}`,
          { token: accessToken }
        );
        setOrder(data.order);
        setTickets(data.tickets);

        if (data.order.status === "paid") {
          setStatus("paid");
        } else if (data.order.status === "failed") {
          setStatus("failed");
        } else {
          setStatus("pending");
        }
      } catch {
        setStatus("failed");
      }
    };

    checkOrder();
    const interval = setInterval(checkOrder, 3000);
    return () => clearInterval(interval);
  }, [params.orderId, accessToken, user, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">Payment Confirmed!</h1>
        <p className="mt-2 text-zinc-500">
          Your {tickets.length} ticket{tickets.length > 1 ? "s have" : " has"} been purchased
          successfully.
        </p>
        {order && (
          <p className="mt-1 text-sm text-zinc-400">Total: {formatCents(order.totalCents)}</p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/my-tickets"
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            View My Tickets
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Browse More Events
          </Link>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <XCircle className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">Payment Failed</h1>
        <p className="mt-2 text-zinc-500">
          Something went wrong with your payment. Please try again.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  // Pending - show payment info
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
      <h1 className="mt-6 text-2xl font-bold text-zinc-900">Processing Payment</h1>
      <p className="mt-2 text-zinc-500">
        Please wait while we confirm your payment...
      </p>
      {order && (
        <p className="mt-4 text-lg font-semibold text-zinc-900">
          Total: {formatCents(order.totalCents)}
        </p>
      )}
      {clientSecret && (
        <p className="mt-6 text-xs text-zinc-400">
          In a production environment, Stripe Elements would appear here for card entry.
          The payment is being processed via the Stripe test API.
        </p>
      )}
    </div>
  );
}
