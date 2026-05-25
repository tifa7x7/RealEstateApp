import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock } from 'lucide-react';
import { BLOG_POSTS, getBlogPost, type BlogSection } from '@/content/blog';
import { buildMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return buildMetadata({ title: 'Статья не найдена', path: `/blog/${slug}` });
  }
  return buildMetadata({
    title: post.title,
    description: post.summary,
    path: `/blog/${post.slug}`,
    ogType: 'article',
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="px-4 py-8 md:px-6 md:py-12 max-w-2xl mx-auto flex flex-col gap-6">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-dim)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:underline w-fit"
      >
        <ArrowLeft size={14} aria-hidden="true" />К списку статей
      </Link>

      <header className="flex flex-col gap-3">
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
          <span className="inline-flex items-center gap-1">
            <Clock size={11} aria-hidden="true" />
            {post.readMinutes} мин
          </span>
          <span>·</span>
          <time dateTime={post.publishedAt}>{formattedDate}</time>
        </div>
        <h1
          className="text-[28px] md:text-[34px] font-semibold leading-[1.15]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {post.title}
        </h1>
        <p className="text-[15px] md:text-[16px] text-[var(--text-dim)] leading-relaxed">
          {post.summary}
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {post.body.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </div>

      <footer className="border-t border-[var(--border)] pt-4 mt-4">
        <Link
          href="/calculator"
          className="text-[14px] font-medium text-[var(--accent)] hover:underline"
        >
          Посчитать на калькуляторе →
        </Link>
      </footer>
    </article>
  );
}

function SectionRenderer({ section }: { section: BlogSection }) {
  if (section.kind === 'heading') {
    return (
      <h2
        className="text-[20px] md:text-[22px] font-semibold leading-tight mt-4"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {section.text}
      </h2>
    );
  }
  if (section.kind === 'paragraph') {
    return (
      <p className="text-[15px] leading-[1.7] text-[var(--text)]">
        {section.text}
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2 text-[15px] leading-[1.6] text-[var(--text)] pl-5 list-disc marker:text-[var(--accent)]">
      {section.items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
