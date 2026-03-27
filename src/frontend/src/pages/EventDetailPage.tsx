import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ExternalLink,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { EventRegistration, TechEvent } from "../backend.d";
import { EventStatus } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import {
  useCreateCheckoutSession,
  useEvents,
  useRegisterForEvent,
} from "../hooks/useQueries";
import {
  CATEGORY_LABELS,
  SAMPLE_EVENTS,
  STATUS_CONFIG,
  formatDateTime,
} from "../utils/sampleData";

export default function EventDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { data: backendEvents } = useEvents();

  const allEvents: TechEvent[] =
    backendEvents && backendEvents.length > 0
      ? [
          ...backendEvents,
          ...SAMPLE_EVENTS.filter(
            (s) =>
              !backendEvents.find((b) => b.id.toString() === s.id.toString()),
          ),
        ]
      : SAMPLE_EVENTS;

  const event = allEvents.find((e) => e.id.toString() === id);

  const registerMutation = useRegisterForEvent();
  const checkoutMutation = useCreateCheckoutSession();

  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    org: "",
  });
  const [submitted, setSubmitted] = useState(false);

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="text-xl font-bold text-foreground mb-2">
            Event not found
          </h1>
          <Link to="/">
            <Button className="btn-gradient text-white border-0 mt-4">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.upcoming;
  const isCompleted = event.status === EventStatus.completed;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.contact) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const registration: EventRegistration = {
      id: BigInt(0),
      eventId: event!.id,
      name: form.name,
      email: form.email,
      contactNumber: form.contact,
      organization: form.org || undefined,
      createdAt: BigInt(Date.now() * 1_000_000),
      isPaid: !event!.isFree,
      stripePaymentId: undefined,
    };

    if (!event!.isFree) {
      // Paid event — create Stripe checkout
      try {
        const url = await checkoutMutation.mutateAsync({
          items: [
            {
              productName: event!.name,
              currency: "inr",
              quantity: BigInt(1),
              priceInCents: BigInt(Math.round(event!.price * 100)),
              productDescription: event!.description.slice(0, 100),
            },
          ],
          successUrl: `${window.location.origin}/events/${event!.id}?success=1`,
          cancelUrl: `${window.location.origin}/events/${event!.id}`,
        });
        window.location.href = url;
      } catch {
        toast.error("Payment setup failed. Please try again.");
      }
      return;
    }

    // Free event
    try {
      await registerMutation.mutateAsync(registration);
      setSubmitted(true);
      toast.success("Registration successful! 🎉");
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  }

  const isLoading = registerMutation.isPending || checkoutMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Back */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors"
            data-ocid="event_detail.back.link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: event info */}
            <div className="lg:col-span-3 space-y-6">
              {/* Banner */}
              <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 bg-gradient-to-br from-[#0A1430] to-[#050A18]">
                {event.bannerBlobId ? (
                  <img
                    src={event.bannerBlobId}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl opacity-30">🌟</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`${statusCfg.color} text-white text-xs font-semibold px-3 py-1 rounded-full`}
                  >
                    {statusCfg.label}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-neon-cyan/30 text-neon-cyan bg-background/50 backdrop-blur-sm"
                  >
                    {CATEGORY_LABELS[event.category] ?? event.category}
                  </Badge>
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3">
                  {event.name}
                </h1>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neon-cyan shrink-0" />
                    <span>
                      {formatDateTime(event.dateTime)}
                      {event.endDateTime
                        ? ` – ${formatDateTime(event.endDateTime)}`
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neon-purple shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  {event.onlineLink && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-neon-blue shrink-0" />
                      <a
                        href={event.onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-blue hover:underline"
                      >
                        {event.onlineLink}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>
                      {Number(event.currentRegistrations)}/
                      {Number(event.registrationLimit)} registered
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-3">
                  About This Event
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Special Instructions */}
              {event.specialInstructions && (
                <div className="glass-card rounded-2xl p-6 border border-yellow-500/20">
                  <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span>⚠️</span> Special Instructions
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {event.specialInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Registration form */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-2xl p-6 sticky top-24">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                    data-ocid="registration.success_state"
                  >
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      You&apos;re Registered!
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      A confirmation will be sent to {form.email}.
                    </p>
                    <Link to="/">
                      <Button className="btn-gradient text-white border-0 w-full">
                        Back to Events
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-foreground text-lg">
                          Register
                        </h3>
                        <span
                          className={`text-sm font-semibold px-3 py-1 rounded-full ${
                            event.isFree
                              ? "bg-green-500/20 text-green-400"
                              : "bg-neon-purple/20 text-neon-purple"
                          }`}
                        >
                          {event.isFree ? "Free" : `₹${event.price}`}
                        </span>
                      </div>
                      {!event.isFree && (
                        <p className="text-xs text-muted-foreground">
                          Secure payment via Stripe
                        </p>
                      )}
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-name" className="text-sm">
                          Full Name *
                        </Label>
                        <Input
                          id="reg-name"
                          value={form.name}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, name: e.target.value }))
                          }
                          placeholder="Your name"
                          required
                          disabled={isCompleted}
                          className="bg-muted/50 border-border/50 focus:border-neon-cyan/50"
                          data-ocid="registration.name.input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-email" className="text-sm">
                          Email *
                        </Label>
                        <Input
                          id="reg-email"
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, email: e.target.value }))
                          }
                          placeholder="you@example.com"
                          required
                          disabled={isCompleted}
                          className="bg-muted/50 border-border/50 focus:border-neon-cyan/50"
                          data-ocid="registration.email.input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-contact" className="text-sm">
                          Contact Number *
                        </Label>
                        <Input
                          id="reg-contact"
                          value={form.contact}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, contact: e.target.value }))
                          }
                          placeholder="+91 XXXXX XXXXX"
                          required
                          disabled={isCompleted}
                          className="bg-muted/50 border-border/50 focus:border-neon-cyan/50"
                          data-ocid="registration.contact.input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-org" className="text-sm">
                          Organization / College{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </Label>
                        <Input
                          id="reg-org"
                          value={form.org}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, org: e.target.value }))
                          }
                          placeholder="Your org or college"
                          disabled={isCompleted}
                          className="bg-muted/50 border-border/50 focus:border-neon-cyan/50"
                          data-ocid="registration.org.input"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full btn-gradient text-white border-0 mt-2"
                        disabled={isLoading || isCompleted}
                        data-ocid="registration.submit.button"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isCompleted ? (
                          "Event Ended"
                        ) : event.isFree ? (
                          "Register Free"
                        ) : (
                          `Pay \u20b9${event.price} & Register`
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
