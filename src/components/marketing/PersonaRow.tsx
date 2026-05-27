import { type LucideIcon } from 'lucide-react';
import { Building2, Compass, TrendingUp, Sparkles } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface Persona {
  icon: LucideIcon;
  nameKey:
    | 'personaBuyerName'
    | 'personaSearcherName'
    | 'personaInvestorName'
    | 'personaCuriousName';
  bodyKey:
    | 'personaBuyerBody'
    | 'personaSearcherBody'
    | 'personaInvestorBody'
    | 'personaCuriousBody';
}

const PERSONAS: readonly Persona[] = [
  { icon: Building2, nameKey: 'personaBuyerName', bodyKey: 'personaBuyerBody' },
  { icon: Compass, nameKey: 'personaSearcherName', bodyKey: 'personaSearcherBody' },
  { icon: TrendingUp, nameKey: 'personaInvestorName', bodyKey: 'personaInvestorBody' },
  { icon: Sparkles, nameKey: 'personaCuriousName', bodyKey: 'personaCuriousBody' },
];

/**
 * Phase 19 — "Кому подходит" row on the marketing homepage. 4-column on
 * lg+, 2x2 on md, stacked on mobile. No CTA per persona — the page-wide
 * CTA pair at the bottom does that work.
 */
export function PersonaRow() {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {PERSONAS.map((p, i) => {
        const Icon = p.icon;
        return (
          <div key={i} className="flex flex-col gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{
                background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
              }}
            >
              <Icon size={18} className="text-[var(--accent)]" aria-hidden="true" />
            </div>
            <h3 className="text-[15px] font-semibold">{t.marketing[p.nameKey]}</h3>
            <p className="text-[13px] text-[var(--text-dim)] leading-relaxed">
              {t.marketing[p.bodyKey]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
