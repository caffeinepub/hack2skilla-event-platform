import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Testimonial } from "../backend.d";
import { SAMPLE_TESTIMONIALS } from "../utils/sampleData";

interface Props {
  testimonials?: Testimonial[];
}

export default function TestimonialsCarousel({ testimonials }: Props) {
  const items =
    testimonials && testimonials.length > 0
      ? testimonials
      : SAMPLE_TESTIMONIALS;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const next = () => setCurrent((c) => (c + 1) % items.length);

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-heading gradient-text mb-3">
            What People Say
          </h2>
          <p className="text-muted-foreground">Voices from our community</p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="glass-card rounded-2xl p-8 md:p-10 text-center"
            >
              <Quote className="w-10 h-10 text-neon-cyan/50 mx-auto mb-6" />
              <p className="text-lg md:text-xl text-foreground leading-relaxed font-medium mb-8">
                &ldquo;{items[current].content}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-foreground">
                  {items[current].name}
                </p>
                <p className="text-sm text-neon-cyan mt-1">
                  {items[current].role}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={prev}
              className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="testimonials.pagination_prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {items.map((item, i) => (
                <button
                  type="button"
                  key={item.id.toString()}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? "bg-neon-cyan w-6" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="testimonials.pagination_next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
