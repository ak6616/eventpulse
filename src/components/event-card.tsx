import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface EventCardProps {
  event: {
    slug: string;
    title: string;
    description: string | null;
    location: string | null;
    startTime: string;
    endTime: string;
    capacity: number;
    ticketsSold: number;
    coverImageUrl: string | null;
  };
}

export function EventCard({ event }: EventCardProps) {
  const spotsLeft = event.capacity - event.ticketsSold;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[16/9] bg-gradient-to-br from-indigo-400 to-purple-500">
        {event.coverImageUrl && (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h3>
        {event.description && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{event.description}</p>
        )}
        <div className="mt-auto pt-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-sm text-zinc-500">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(event.startTime)}
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </div>
          )}
          <div className="mt-2">
            {spotsLeft > 0 ? (
              <span className="inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                {spotsLeft} spots left
              </span>
            ) : (
              <span className="inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                Sold out
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
