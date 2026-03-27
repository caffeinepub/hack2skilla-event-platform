import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Calendar, ExternalLink, MapPin, Users } from "lucide-react";
import type { TechEvent } from "../backend.d";
import {
  CATEGORY_LABELS,
  STATUS_CONFIG,
  formatDate,
} from "../utils/sampleData";

interface EventCardProps {
  event: TechEvent;
  index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const statusCfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.upcoming;
  const pct =
    event.registrationLimit > 0n
      ? Math.min(
          100,
          Number((event.currentRegistrations * 100n) / event.registrationLimit),
        )
      : 0;

  return (
    <div
      className="glass-card rounded-2xl overflow-hidden flex flex-col group hover:border-neon-cyan/30 hover:shadow-neon-cyan transition-all duration-300"
      data-ocid={`events.item.${index + 1}`}
    >
      {/* Banner */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#0A1430] to-[#050A18]">
        {event.bannerBlobId ? (
          <img
            src={event.bannerBlobId}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-30">
              {event.category === "hackathon"
                ? "⚡"
                : event.category === "workshop"
                  ? "🛠"
                  : event.category === "aiConference"
                    ? "🤖"
                    : "🎙"}
            </span>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`${statusCfg.color} text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1`}
          >
            {event.status === "live" && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
            )}
            {statusCfg.label}
          </span>
        </div>
        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              event.isFree
                ? "bg-green-500/80 text-white"
                : "bg-neon-purple/80 text-white"
            }`}
          >
            {event.isFree ? "Free" : `₹${event.price}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base text-foreground line-clamp-2 leading-tight">
            {event.name}
          </h3>
          <Badge
            variant="outline"
            className="shrink-0 text-xs border-neon-cyan/30 text-neon-cyan"
          >
            {CATEGORY_LABELS[event.category] ?? event.category}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
            <span>{formatDate(event.dateTime)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neon-purple shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          {event.registrationLimit > 0n && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-neon-blue shrink-0" />
              <span>
                {Number(event.currentRegistrations)}/
                {Number(event.registrationLimit)} registered
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {event.registrationLimit > 0n && (
          <div className="space-y-1">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  pct >= 90
                    ? "bg-red-500"
                    : pct >= 70
                      ? "bg-yellow-500"
                      : "bg-neon-cyan"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{pct}% filled</p>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            to="/events/$id"
            params={{ id: event.id.toString() }}
            className="flex-1"
          >
            <Button
              className="w-full btn-gradient text-white border-0 text-sm"
              size="sm"
              disabled={event.status === "completed"}
              data-ocid={`events.register.button.${index + 1}`}
            >
              {event.status === "completed" ? "Ended" : "Register"}
            </Button>
          </Link>
          {event.onlineLink && (
            <a
              href={event.onlineLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                variant="outline"
                className="border-border/50 px-2"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
