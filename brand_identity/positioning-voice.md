# Positioning & Voice

## The one-line pitch

> RealEstateApp helps everyday buyers decide whether a new-build apartment is worth buying — with Bloomberg-level analysis and zero learning curve.

## What we are (in this order)

1. A **decision tool**. The user comes asking "should I buy this?" and we give them an answer they can defend to a partner or a banker.
2. A **search tool**. We help them find candidates worth deciding about.
3. A **market-intel tool**. We surface trends and patterns when they want context.

Every UI surface, headline, feature priority, and upsell argument must respect this ordering. **The homepage is search-first; the calculator is decision-first; the analytics page is market-intel.** Never invert this.

## Voice

- **Calm.** Money decisions are stressful enough. The product never shouts.
- **Direct.** Short sentences. Real numbers. No "perhaps consider exploring."
- **Premium without arrogance.** Playfair for hero numbers, DM Sans for body — restrained, not flashy. Russian SaaS exclamation-mark culture is not us.
- **Sober about uncertainty.** When we estimate, we say so. When we calculate from user inputs, we say that too. We never present an estimate as a measurement (see [`colors.md`](colors.md#confidence-tiers) and the data-confidence pattern in [`CLAUDE.md`](../CLAUDE.md)).
- **Bilingual but Russian-first.** Russian is the default, English is real (not auto-translated). Don't write Russian that reads like English-translated, and don't write English that reads like Russian-translated. Hire or pair-edit when in doubt.

## Tone do / don't

| Do | Don't |
|---|---|
| "Покажу, стоит ли покупать" | "Революционная платформа для анализа недвижимости" |
| "Цена / м² — 247 000 ₽ · оценка модели" | "ИСКЛЮЧИТЕЛЬНАЯ ВОЗМОЖНОСТЬ!" |
| "Семейная ипотека: 6% до 6 млн ₽, 21% на остаток" | "Лучшая ипотека в Крыму" (subjective, can't defend) |
| "Сохранено" (toast, 2s) | "Поздравляем! Ваш расчёт успешно сохранён в вашем личном кабинете!" |
| "В Pro: уведомления о снижении цены" | "Откройте безграничные возможности с премиум-подпиской!" |
| "Найдено 12 проектов" | "Мы нашли для вас 12 потрясающих проектов" |

## Headline templates

These are the patterns to reach for first when writing a new headline. Adapt; don't blindly fill.

| Surface | Template | Example |
|---|---|---|
| Homepage hero | "*[Verb of decision] [object]* — *[what we promise in one phrase]*" | "Найди квартиру и просчитай инвестицию — за минуту, без брокера" |
| Project detail title | "*[Project name]* — *[city] · [developer]*" | "ЖК «Ривьера Парк» — Ялта · ЮгСтройИнвест" |
| Calculator result hero | "*[Number]* — *[unit]* / *[what it means]*" | "12.4% годовых — Cash-on-Cash при текущих параметрах" |
| Pro upsell | "*[Concrete benefit verb-phrase]* — *[в Pro / with Pro]*" | "Сравнивай до 5 квартир по всем метрикам — в Pro" |
| Empty state | "*[State as fact]*. *[One-line next action]*." | "Пока нечего сравнивать. Откройте проект и добавьте его в сравнение." |
| Error state | "*[Plain what happened]*. *[Plain what to do]*." | "Не удалось загрузить проекты. Обновите страницу или попробуйте позже." |

## Forbidden phrases

- "Революция" / "революционный"
- "Уникальная возможность"
- "Только сегодня"
- "Лучший в Крыму" / "№1"
- "Эксклюзив"
- "Скидка X% — спешите!"
- Any sentence with three or more exclamation marks across two consecutive lines
- Emoji clusters in headlines (one tasteful icon component is fine; ✨🎉🔥🚀 is not)

## Marketing-copy patterns by surface

### Homepage (Phase 10 redesign)

```
[H1, Playfair, ~32-40px]
Найди квартиру в Крыму и
просчитай инвестицию.

[Subhead, DM Sans, 16px, --text-dim]
18 проектов, 130 квартир, ипотека, аренда, выход за 10 лет — в одном калькуляторе.

[Search input — single field, large]
[City pill row: Ялта · Симферополь · Алушта · Евпатория · ...]
```

### Calculator (Phase 11 wizard intro)

```
[H2] Что считаем?
[Body] За 3 шага получим монтly cashflow, ROI и срок окупаемости.
[Step 1] Сколько стоит квартира и где она?
[Step 2] Берёте ипотеку?
[Step 3] Будете сдавать в аренду?
```

### UpgradePrompt (current; needs Phase 15 honesty pass)

Current default features list advertises PDF export and ad-free. Both are unimplemented. **Trim the list to what actually ships** until Phase 15. Don't promise vapor.

### Toast confirmations

Two words, no period, auto-dismiss 2s:
- "Сохранено"
- "Добавлено в избранное"
- "Удалено"
- "Скопировано"

If the action might fail silently, use a toast variant with an icon + colour, but keep the text just as short.

## Naming things

- Tabs and nav items: a noun, never an implementation noun. `Поиск` not `Таблица`. `Карта` not `Leaflet`. `Калькулятор` not `Расчётный модуль`.
- Buttons: a verb. `Сохранить`, `Добавить`, `Сравнить`, `Перейти на Pro`.
- Form labels: a noun phrase, not a sentence. `Цена` not `Введите цену`.

## When to override the voice

For legal / compliance copy (privacy, terms, mortgage program disclosures), formality wins over warmth. Quote the regulation if you can; don't paraphrase taxes into vibes.
