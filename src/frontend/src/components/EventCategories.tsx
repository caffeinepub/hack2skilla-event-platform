import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const CATEGORIES = [
  {
    id: "hackathon",
    icon: "⚡",
    label: "Hackathons",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]",
    description:
      "48-72 hour intensive coding sprints where teams build innovative solutions from scratch.",
    details:
      "Compete with the best developers, win prizes up to ₹50L, and get noticed by top companies. Open to all skill levels.",
  },
  {
    id: "workshop",
    icon: "🛠️",
    label: "Workshops",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    description:
      "Hands-on learning sessions led by industry experts with real projects.",
    details:
      "Small cohorts of 20-50 participants for focused, practical skill building. Certificates of completion provided.",
  },
  {
    id: "seminar",
    icon: "🎯",
    label: "Seminars",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]",
    description:
      "Expert-led talks on emerging technologies and industry trends.",
    details:
      "Engage directly with thought leaders. Q&A sessions, panel discussions, and networking opportunities.",
  },
  {
    id: "webinar",
    icon: "🖥️",
    label: "Webinars",
    color: "from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(14,165,233,0.2)]",
    description:
      "Online interactive sessions accessible from anywhere in the world.",
    details:
      "Live polls, breakout rooms, and on-demand recordings. Perfect for remote learners and professionals.",
  },
  {
    id: "aiConference",
    icon: "🤖",
    label: "AI Conferences",
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(167,139,250,0.2)]",
    description:
      "Deep dives into machine learning, LLMs, computer vision, and AI ethics.",
    details:
      "Research presentations, demo showcases, and startup pitches. Meet the teams building the future of AI.",
  },
  {
    id: "summit",
    icon: "🏔️",
    label: "Summits",
    color: "from-fuchsia-500/20 to-fuchsia-500/5",
    border: "border-fuchsia-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(217,70,239,0.2)]",
    description:
      "Large-scale gatherings of industry leaders, investors, and innovators.",
    details:
      "Multi-track sessions, investor meetups, startup demos, and gala networking dinners.",
  },
  {
    id: "techCarnival",
    icon: "🎉",
    label: "Tech Carnivals",
    color: "from-pink-500/20 to-pink-500/5",
    border: "border-pink-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]",
    description:
      "Fun-filled expos with gadgets, demos, gaming zones, and tech exhibitions.",
    details:
      "Open to families and students. Robotics showcases, VR experiences, coding challenges, and more.",
  },
  {
    id: "podcast",
    icon: "🎙️",
    label: "Podcasts",
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    glow: "hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]",
    description:
      "Live podcast recordings with tech founders, engineers, and researchers.",
    details:
      "Exclusive audience Q&A, behind-the-scenes access, and a free recording link post-event.",
  },
];

export default function EventCategories() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section id="categories" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-heading gradient-text mb-3">
            Event Categories
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From hackathons to AI conferences — find the event that fuels your
            growth.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const isOpen = expanded === cat.id;
            return (
              <motion.div
                key={cat.id}
                layout
                className={`glass-card rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 ${cat.border} ${cat.glow}`}
                onClick={() => setExpanded(isOpen ? null : cat.id)}
                data-ocid={`categories.${cat.id}.card`}
              >
                <div className={`p-4 bg-gradient-to-br ${cat.color}`}>
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <h3 className="font-semibold text-sm text-foreground">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      Learn more
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                        {cat.details}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
