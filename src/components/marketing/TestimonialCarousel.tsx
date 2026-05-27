'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export interface Testimonial {
  quote: string;
  author: string;
  attribution?: string;
}

export interface TestimonialCarouselProps {
  testimonials?: readonly Testimonial[];
  placeholder?: string;
}

/**
 * Phase 19 — serif quote + small attribution carousel. Initial state is
 * a placeholder ("Скоро здесь будут отзывы пользователей") because the
 * marketing site goes live before we have real testimonials. The slot
 * exists for when real ones arrive; the carousel logic ships now so the
 * UI is ready when the content is.
 */
export function TestimonialCarousel({
  testimonials,
  placeholder = 'Скоро здесь будут отзывы пользователей.',
}: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
        <Quote size={32} className="text-[var(--accent)] opacity-40" aria-hidden="true" />
        <p
          className="text-[18px] md:text-[20px] leading-relaxed text-[var(--text-dim)] italic"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {placeholder}
        </p>
      </div>
    );
  }

  const current = testimonials[index];
  if (!current) return null;

  const goPrev = () => setIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));

  return (
    <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
      <Quote size={32} className="text-[var(--accent)] opacity-40" aria-hidden="true" />
      <blockquote
        className="text-[20px] md:text-[24px] leading-relaxed"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        &laquo;{current.quote}&raquo;
      </blockquote>
      <div className="text-[13px] text-[var(--text-dim)]">
        <span className="font-semibold text-[var(--text)]">{current.author}</span>
        {current.attribution && <span> · {current.attribution}</span>}
      </div>
      {testimonials.length > 1 && (
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous testimonial"
            className="p-2 rounded-full border border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={
                  'w-2 h-2 rounded-full transition-colors ' +
                  (i === index ? 'bg-[var(--accent)]' : 'bg-[var(--border)]')
                }
              />
            ))}
          </div>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next testimonial"
            className="p-2 rounded-full border border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
