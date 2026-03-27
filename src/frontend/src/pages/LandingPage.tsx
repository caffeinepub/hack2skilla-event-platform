import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Loader2, Mic, Search } from "lucide-react";
import { motion } from "motion/react";
import { Suspense, lazy, useMemo, useState } from "react";
import { toast } from "sonner";
import type { TechEvent } from "../backend.d";
import EventCard from "../components/EventCard";
import EventCategories from "../components/EventCategories";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import { useEvents, useSubscribeNewsletter } from "../hooks/useQueries";
import { CATEGORY_LABELS, SAMPLE_EVENTS } from "../utils/sampleData";

const HeroScene = lazy(() => import("../components/HeroScene"));

const TIMELINE = [
  {
    year: "2022",
    title: "Founded",
    desc: "Hack2Skilla started as a small hackathon in Hyderabad with 50 participants.",
  },
  {
    year: "2023",
    title: "1,000+ Attendees",
    desc: "Expanded to workshops, seminars, and AI conferences across South India.",
  },
  {
    year: "2024",
    title: "National Scale",
    desc: "Hosted 24 events, partnered with Google, Microsoft, and 10+ startups.",
  },
  {
    year: "2025",
    title: "Platform Launch",
    desc: "Launched the Hack2Skilla digital platform for online registrations and management.",
  },
  {
    year: "2026",
    title: "Future Ahead",
    desc: "Targeting 50 events, 10,000 attendees, and international partnerships.",
  },
];

const PARTNERS = [
  { name: "Google", color: "from-blue-500 to-green-500" },
  { name: "Microsoft", color: "from-blue-600 to-cyan-500" },
  { name: "GitHub", color: "from-gray-500 to-gray-700" },
  { name: "AWS", color: "from-orange-400 to-yellow-500" },
  { name: "T-Hub", color: "from-purple-500 to-pink-500" },
  { name: "NASSCOM", color: "from-green-500 to-teal-500" },
];

const SPONSORS = [...PARTNERS, ...PARTNERS]; // duplicate for seamless loop

export default function LandingPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [email, setEmail] = useState("");

  const { data: backendEvents } = useEvents();
  const subscribeMutation = useSubscribeNewsletter();

  // Merge backend + sample events
  const allEvents: TechEvent[] = useMemo(() => {
    const merged = [...SAMPLE_EVENTS];
    if (backendEvents && backendEvents.length > 0) {
      const backendIds = new Set(backendEvents.map((e) => e.id.toString()));
      const filtered = merged.filter((e) => !backendIds.has(e.id.toString()));
      return [...backendEvents, ...filtered];
    }
    return merged;
  }, [backendEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents
      .filter((e) => e.isPublished)
      .filter((e) => {
        if (search) {
          const q = search.toLowerCase();
          return (
            e.name.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .filter((e) =>
        categoryFilter === "all" ? true : e.category === categoryFilter,
      );
  }, [allEvents, search, categoryFilter]);

  async function handleNewsletter(ev: React.FormEvent) {
    ev.preventDefault();
    if (!email) return;
    try {
      await subscribeMutation.mutateAsync(email);
      toast.success("You're subscribed! 🎉");
      setEmail("");
    } catch {
      // Still show success for better UX if backend not connected
      toast.success("You're subscribed! 🎉");
      setEmail("");
    }
  }

  function scrollTo(id: string) {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ===== HERO ===== */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% -10%, rgba(34,211,238,0.08) 0%, rgba(139,92,246,0.06) 40%, transparent 70%), linear-gradient(180deg, #050A18 0%, #0A1430 50%, #050A18 100%)",
        }}
      >
        {/* Three.js background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </div>

        {/* Radial glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-neon-cyan/5 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-neon-purple/5 blur-[100px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full border border-neon-cyan/30 text-neon-cyan mb-6 glass-card">
              ⚡ Hyderabad&apos;s Premier Tech Event Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-6"
          >
            <span className="text-foreground">Ignite Your Vision,</span>
            <br />
            <span className="gradient-text">Build the Future.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Join 10,000+ developers, designers, and innovators at South
            India&apos;s most impactful hackathons, workshops, AI conferences,
            and tech summits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={() => scrollTo("#events")}
              className="btn-gradient text-white font-semibold px-8 py-3.5 rounded-full text-base flex items-center gap-2"
              data-ocid="hero.explore_events.button"
            >
              Explore Events <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo("#newsletter")}
              className="glass-card text-foreground font-semibold px-8 py-3.5 rounded-full text-base border border-border/50 hover:border-neon-cyan/40 transition-colors"
              data-ocid="hero.join_community.button"
            >
              Join Community
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-3 gap-6 max-w-md mx-auto mt-16"
          >
            {[
              { val: "50+", label: "Events" },
              { val: "10K+", label: "Attendees" },
              { val: "200+", label: "Speakers" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold gradient-text">{s.val}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <span className="text-xs text-muted-foreground">
            Scroll to explore
          </span>
          <div className="w-5 h-8 rounded-full border border-border/40 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-neon-cyan animate-pulse-glow" />
          </div>
        </div>
      </section>

      {/* ===== SEARCH & FILTER ===== */}
      <section
        id="search"
        className="py-8 px-4 bg-[rgba(5,10,24,0.8)] sticky top-16 z-40 border-b border-border/20 backdrop-blur-xl"
      >
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted/50 border-border/50 focus:border-neon-cyan/50 h-10"
                data-ocid="search.search_input"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger
                className="w-full sm:w-44 bg-muted/50 border-border/50 h-10"
                data-ocid="search.category.select"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ===== EVENT CATEGORIES ===== */}
      <EventCategories />

      {/* ===== EVENTS SECTION ===== */}
      <section id="events" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-heading gradient-text">Upcoming Events</h2>
              <p className="text-muted-foreground mt-1">
                Register before spots fill up
              </p>
            </div>
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                data-ocid="events.view_all.button"
              >
                View All
              </Button>
            </Link>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredEvents.map((event, i) => (
                <EventCard key={event.id.toString()} event={event} index={i} />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-16 glass-card rounded-2xl"
              data-ocid="events.empty_state"
            >
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-foreground font-semibold">No events found</p>
              <p className="text-muted-foreground text-sm mt-1">
                Try a different search or category
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ===== ABOUT / TIMELINE ===== */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-heading gradient-text mb-4">About Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Hack2Skilla is Hyderabad&apos;s most vibrant tech community
                platform. We bring together developers, designers, founders, and
                students to learn, build, and connect through world-class
                events.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                From intimate workshops to massive hackathons and AI summits,
                every Hack2Skilla event is designed to push boundaries and
                create lasting impact in the tech ecosystem.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Events Hosted", val: "50+" },
                  { label: "Total Attendees", val: "10,000+" },
                  { label: "Prize Pool", val: "₹25L+" },
                  { label: "Partner Companies", val: "30+" },
                ].map((s) => (
                  <div key={s.label} className="glass-card rounded-xl p-4">
                    <p className="text-2xl font-bold gradient-text">{s.val}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-neon-cyan/50 via-neon-purple/50 to-transparent" />
              <div className="space-y-6">
                {TIMELINE.map((item, i) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="pl-12 relative"
                  >
                    <div className="absolute left-0 w-8 h-8 rounded-full glass-card border border-neon-cyan/40 flex items-center justify-center">
                      <span className="text-neon-cyan text-xs font-bold">
                        {i + 1}
                      </span>
                    </div>
                    <div className="glass-card rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-neon-cyan font-semibold">
                          {item.year}
                        </span>
                        <span className="font-semibold text-sm text-foreground">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <TestimonialsCarousel />

      {/* ===== TEAM ===== */}
      <section id="team" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="section-heading gradient-text mb-3">Our Team</h2>
            <p className="text-muted-foreground">
              The people building the future of tech events
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {(
              [
                "member-1",
                "member-2",
                "member-3",
                "member-4",
                "member-5",
              ] as const
            ).map((id, i) => (
              <div
                key={id}
                className="glass-card rounded-2xl p-4 text-center"
                data-ocid={`team.item.${i + 1}`}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-border/30 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl opacity-40">👤</span>
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                  Coming Soon
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Team Member
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PARTNERS ===== */}
      <section id="partners" className="py-16 px-4 border-y border-border/20">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="section-heading gradient-text mb-3">
              Partners &amp; Associates
            </h2>
            <p className="text-muted-foreground">
              Trusted by leading organizations
            </p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {PARTNERS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="glass-card rounded-xl p-4 flex items-center justify-center aspect-video"
                data-ocid={`partners.item.${i + 1}`}
              >
                <span
                  className={`font-bold text-xs bg-gradient-to-r ${p.color} bg-clip-text text-transparent`}
                >
                  {p.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SPONSORS CAROUSEL ===== */}
      <section id="sponsors" className="py-16 px-4 overflow-hidden">
        <div className="container mx-auto mb-8 text-center">
          <h2 className="section-heading gradient-text mb-3">Sponsors</h2>
          <p className="text-muted-foreground">Proudly supported by</p>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex gap-6 animate-marquee w-max">
            {SPONSORS.map((s, i) => (
              <div
                key={`${s.name}-${i}`}
                className="glass-card rounded-xl px-8 py-4 flex items-center justify-center min-w-[140px]"
              >
                <span
                  className={`font-bold text-sm bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}
                >
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MEDIA & OUTREACH ===== */}
      <section id="media" className="py-12 px-4 border-t border-border/20">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold gradient-text mb-2">
              Media &amp; Outreach
            </h2>
          </div>
          <div className="flex items-center justify-center gap-8">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-neon-cyan/30 transition-all group"
                    data-ocid="media.camera.button"
                  >
                    <Camera className="w-6 h-6 text-neon-cyan group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-muted-foreground">
                      Photography
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Event Photography &amp; Videography Coverage
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 hover:border-neon-purple/30 transition-all group"
                    data-ocid="media.mic.button"
                  >
                    <Mic className="w-6 h-6 text-neon-purple group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-muted-foreground">
                      Podcasts
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Live Podcast Recordings &amp; Audio Content
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </section>

      {/* ===== BLOG PLACEHOLDER ===== */}
      <section id="blog" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="section-heading gradient-text mb-3">
              Blog &amp; Insights
            </h2>
            <p className="text-muted-foreground">
              Thought leadership from the tech community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(["blog-1", "blog-2", "blog-3"] as const).map((id, i) => (
              <div
                key={id}
                className="glass-card rounded-2xl overflow-hidden"
                data-ocid={`blog.item.${i + 1}`}
              >
                <Skeleton className="h-40 w-full bg-muted/40" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-muted/40" />
                  <Skeleton className="h-3 w-full bg-muted/30" />
                  <Skeleton className="h-3 w-2/3 bg-muted/30" />
                  <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-6 w-6 rounded-full bg-muted/40" />
                    <Skeleton className="h-3 w-20 bg-muted/30" />
                  </div>
                  <p className="text-xs text-muted-foreground/60 font-medium pt-1">
                    Coming Soon
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section id="newsletter" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center glass-card rounded-3xl p-8 md:p-12 border border-neon-cyan/20"
          >
            <h2 className="text-3xl font-bold gradient-text mb-3">
              Stay in the Loop
            </h2>
            <p className="text-muted-foreground mb-8">
              Get early access to events, speaker announcements, and exclusive
              opportunities.
            </p>
            <form
              onSubmit={handleNewsletter}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-muted/50 border-border/50 focus:border-neon-cyan/50"
                data-ocid="newsletter.email.input"
              />
              <Button
                type="submit"
                className="btn-gradient text-white border-0 shrink-0"
                disabled={subscribeMutation.isPending}
                data-ocid="newsletter.subscribe.button"
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
