import { EventCategory, EventStatus } from "../backend.d";
import type { TechEvent, Testimonial } from "../backend.d";

export const SAMPLE_EVENTS: TechEvent[] = [
  {
    id: BigInt(1),
    name: "HyderHack 2026 — 48hr Hackathon",
    category: EventCategory.hackathon,
    description:
      "Join 500+ developers, designers, and innovators for a 48-hour hackathon. Build AI-powered solutions for real-world challenges. ₹50,000 in prizes and direct mentorship from top engineers at Google, Microsoft, and startups.",
    dateTime: BigInt(new Date("2026-04-15T09:00:00").getTime() * 1_000_000),
    endDateTime: BigInt(new Date("2026-04-17T09:00:00").getTime() * 1_000_000),
    location: "HICC Convention Centre, Hyderabad",
    onlineLink: undefined,
    isFree: false,
    price: 299,
    registrationLimit: BigInt(500),
    currentRegistrations: BigInt(342),
    status: EventStatus.upcoming,
    isPublished: true,
    bannerBlobId: "/assets/generated/event-hackathon.dim_800x450.jpg",
    specialInstructions:
      "Bring your laptop and charger. Teams of 2-4. Meals provided.",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: BigInt(2),
    name: "AI Summit Hyderabad 2026",
    category: EventCategory.aiConference,
    description:
      "The premier AI conference in South India. Featuring keynotes from leading AI researchers, hands-on workshops on LLMs, Computer Vision, and MLOps. 20+ speakers across 2 days with networking sessions and startup showcases.",
    dateTime: BigInt(new Date("2026-05-10T10:00:00").getTime() * 1_000_000),
    endDateTime: BigInt(new Date("2026-05-11T18:00:00").getTime() * 1_000_000),
    location: "Novotel HICC, Hyderabad",
    onlineLink: "https://aisummit.live",
    isFree: false,
    price: 999,
    registrationLimit: BigInt(300),
    currentRegistrations: BigInt(187),
    status: EventStatus.upcoming,
    isPublished: true,
    bannerBlobId: "/assets/generated/event-ai-summit.dim_800x450.jpg",
    specialInstructions:
      "Business casual dress code. Lunch and refreshments included.",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: BigInt(3),
    name: "Full Stack Mastery Workshop",
    category: EventCategory.workshop,
    description:
      "Intensive 2-day workshop covering React 19, Node.js, PostgreSQL, Docker, and CI/CD pipelines. Build and deploy a production-ready app from scratch. Limited to 40 participants for hands-on learning.",
    dateTime: BigInt(new Date("2026-04-05T09:00:00").getTime() * 1_000_000),
    endDateTime: BigInt(new Date("2026-04-06T18:00:00").getTime() * 1_000_000),
    location: "T-Hub, Hyderabad",
    onlineLink: undefined,
    isFree: true,
    price: 0,
    registrationLimit: BigInt(40),
    currentRegistrations: BigInt(38),
    status: EventStatus.live,
    isPublished: true,
    bannerBlobId: "/assets/generated/event-workshop.dim_800x450.jpg",
    specialInstructions:
      "Bring your laptop with Node.js 20+ installed. VS Code recommended.",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: BigInt(4),
    name: "Tech Voices Podcast Live",
    category: EventCategory.podcast,
    description:
      "Live recording of the most popular tech podcast in Hyderabad. This episode features CTO of Zepto, Founder of a Bangalore unicorn, and a senior engineer at Anthropic discussing the future of AI in India. Q&A session included.",
    dateTime: BigInt(new Date("2026-03-28T18:00:00").getTime() * 1_000_000),
    endDateTime: BigInt(new Date("2026-03-28T20:00:00").getTime() * 1_000_000),
    location: "Online — YouTube Live",
    onlineLink: "https://youtube.com/techvoices",
    isFree: true,
    price: 0,
    registrationLimit: BigInt(1000),
    currentRegistrations: BigInt(756),
    status: EventStatus.completed,
    isPublished: true,
    bannerBlobId: "/assets/generated/event-podcast.dim_800x450.jpg",
    specialInstructions: "Register to get the recording link after the event.",
    createdAt: BigInt(Date.now() * 1_000_000),
  },
];

export const SAMPLE_TESTIMONIALS: Testimonial[] = [
  {
    id: BigInt(1),
    name: "Priya Sharma",
    role: "Software Engineer at Google",
    content:
      "HyderHack was an absolute game-changer! I met my co-founder there, and we've since raised a seed round. The mentorship and energy was unlike anything else.",
    isPublished: true,
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: BigInt(2),
    name: "Rahul Verma",
    role: "AI Researcher at IIT Hyderabad",
    content:
      "The AI Summit brought together the best minds in the field. The workshops were incredibly hands-on and I left with practical skills I'm using every day in my research.",
    isPublished: true,
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: BigInt(3),
    name: "Anjali Mehta",
    role: "Founder, FinTech Startup",
    content:
      "Attending the Tech Summit was pivotal for my startup. I connected with 3 investors who eventually joined our pre-seed round. Highly recommend to every founder.",
    isPublished: true,
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: BigInt(4),
    name: "Karthik Reddy",
    role: "Full Stack Developer",
    content:
      "The workshops are extremely well-structured. I attended the Full Stack workshop and went from zero to deploying a live app in 2 days. World-class instruction.",
    isPublished: true,
    createdAt: BigInt(Date.now() * 1_000_000),
  },
  {
    id: BigInt(5),
    name: "Nisha Patel",
    role: "Product Manager at Swiggy",
    content:
      "Hack2Skilla events are consistently the best tech events in Hyderabad. The community, the networking, the quality of speakers — everything is top-tier.",
    isPublished: true,
    createdAt: BigInt(Date.now() * 1_000_000),
  },
];

export function bigintToDate(ns: bigint): Date {
  return new Date(Number(ns) / 1_000_000);
}

export function dateToBigint(d: Date): bigint {
  return BigInt(Math.floor(d.getTime() * 1_000_000));
}

export function formatDate(ns: bigint): string {
  const date = bigintToDate(ns);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(ns: bigint): string {
  const date = bigintToDate(ns);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const CATEGORY_LABELS: Record<string, string> = {
  hackathon: "Hackathon",
  workshop: "Workshop",
  seminar: "Seminar",
  webinar: "Webinar",
  aiConference: "AI Conference",
  summit: "Summit",
  techCarnival: "Tech Carnival",
  podcast: "Podcast",
};

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  live: { label: "Live", color: "bg-green-500" },
  upcoming: { label: "Upcoming", color: "bg-blue-500" },
  completed: { label: "Completed", color: "bg-gray-500" },
};
