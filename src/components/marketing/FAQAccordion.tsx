'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: readonly FAQItem[];
  /** Default open index (-1 = all collapsed). */
  defaultOpenIndex?: number;
}

/**
 * Phase 19 — single-line question rows with a chevron, expanding to a
 * 1-2 paragraph answer. Hairline dividers between rows, no internal
 * card chrome — relies on the surrounding slab for context.
 *
 * Accordion is single-open (clicking a different row collapses the
 * previous one) — keeps the page from growing unboundedly.
 */
export function FAQAccordion({ items, defaultOpenIndex = -1 }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex);

  return (
    <div className="flex flex-col divide-y divide-[var(--border)] max-w-3xl mx-auto w-full">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : i)}
              aria-expanded={open}
              className={
                'w-full flex items-center justify-between gap-4 py-5 text-left ' +
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-md'
              }
            >
              <span className="text-[15px] md:text-[16px] font-medium text-[var(--text)]">
                {item.question}
              </span>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={
                  'shrink-0 text-[var(--text-dim)] transition-transform ' +
                  (open ? 'rotate-180' : '')
                }
              />
            </button>
            {open && (
              <div className="pb-5 -mt-1">
                <p className="text-[14px] text-[var(--text-dim)] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
