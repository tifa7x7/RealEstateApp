import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { BLOG_POSTS } from '@/content/blog';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Блог: ипотека, налоги, инвестиции в новостройки',
  description:
    'Семейная ипотека, маткапитал, налоги, метрики доходности. Без воды — конкретные цифры и формулы.',
  path: '/blog',
});

export default function BlogIndexPage() {
  return (
    <div className="px-4 py-8 md:px-6 md:py-12 max-w-3xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
          Блог
        </span>
        <h1
          className="text-[28px] md:text-[36px] font-semibold leading-[1.15]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Ипотека, налоги, инвестиции — без воды
        </h1>
        <p className="text-[14px] md:text-[16px] text-[var(--text-dim)] max-w-2xl">
          Что нужно знать перед покупкой новостройки в Крыму. Конкретные цифры,
          формулы и таблицы — те же, что внутри калькулятора.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {BLOG_POSTS.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="block focus-visible:outline-none">
              <Card interactive>
                <article className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full"
                        style={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1 ml-auto">
                      <Clock size={11} aria-hidden="true" />
                      {post.readMinutes} мин
                    </span>
                  </div>
                  <h2
                    className="text-[18px] md:text-[20px] font-semibold leading-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {post.title}
                  </h2>
                  <p className="text-[13px] text-[var(--text-dim)] leading-relaxed">
                    {post.summary}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent)] mt-1">
                    Читать <ChevronRight size={13} aria-hidden="true" />
                  </span>
                </article>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
