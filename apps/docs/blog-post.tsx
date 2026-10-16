// Shared by the blog index, every post and scripts/build-rss.mjs (which
// reads data/blog-posts.json directly). A post route passes its slug; the
// title, date and description come from that one file, so the index, the
// post, its JSON-LD and /rss.xml can't disagree.
import type { ReactNode } from "react";
import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "./nav.js";
import { SiteFooter } from "./site-footer.js";
import { JsonLd, SITE_URL, pageMeta } from "./seo.js";
import blog from "./data/blog-posts.json";

export type Tag = "Release" | "Guide" | "Story";

export interface PostMeta {
  slug: string;
  title: string;
  /** The day the post was published. Absent on a draft (drafts/blog), which is never in a production build. */
  date?: string;
  description: string;
  tags: Tag[];
  draft?: boolean;
}

export const AUTHOR = blog.author;
export const TAGS = blog.tags as Tag[];
export const POSTS: PostMeta[] = ([...blog.posts] as PostMeta[]).sort((a, b) => (b.date ?? "9999").localeCompare(a.date ?? "9999"));

export function findPost(slug: string): PostMeta {
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`[blog] no post "${slug}" in data/blog-posts.json`);
  return post;
}

export const tagId = (tag: string) => tag.toLowerCase();

export function formatDate(iso: string | undefined): string {
  if (!iso) return "Draft, dated when published";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function postMeta(slug: string) {
  const post = findPost(slug);
  const meta = pageMeta(`/blog/${slug}`, { title: post.title, description: post.description, image: `/og/blog-${slug}.png` });
  const feed = { rel: "alternate", href: "/rss.xml", type: "application/rss+xml", title: "Devora.js blog" };
  return { ...meta, head: { ...meta.head, links: [...meta.head.links, feed] } };
}

export const BLOG_CSS = `
.devora-page .post-header { margin-bottom: 2rem; }
.devora-page .post-header h1 { margin-bottom: 0.6rem; }
.post-byline { display: flex; flex-wrap: wrap; gap: 0.25rem 0.75rem; font-size: 0.875rem; color: var(--devora-fg-muted); }
.post-byline a { color: var(--devora-fg-muted); }
.post-tags { display: inline-flex; gap: 0.35rem; }
.post-tag { font-size: 0.72rem; font-weight: 700; padding: 0.1rem 0.55rem; border-radius: 999px; border: 1px solid var(--devora-border); color: var(--devora-fg-muted); }
.devora-page .post-body pre { margin: 0; }
.post-code { margin: 1rem 0; border: 1px solid var(--devora-border); border-radius: var(--devora-radius); background: var(--devora-card); overflow-x: auto; }
.post-code pre { margin: 0; padding: 0.9rem 1.1rem; font-size: 0.85rem; line-height: 1.55; }
.post-note { border-left: 4px solid var(--devora-accent-from); padding: 0.1rem 0 0.1rem 1rem; margin: 1.25rem 0; }
.devora-page .post-note p { margin: 0.4rem 0; }
.post-table-wrap { overflow-x: auto; margin: 1rem 0; border: 1px solid var(--devora-border); border-radius: var(--devora-radius); }
.post-table { width: 100%; min-width: 520px; border-collapse: collapse; font-size: 0.88rem; }
.post-table th, .post-table td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--devora-border); vertical-align: top; }
.post-table th { font-size: 0.75rem; background: var(--devora-card); color: var(--devora-fg-muted); }
.devora-page .post-body { max-width: 46rem; }
.devora-page .post-body h2 { margin-top: 2.25rem; }
.post-footer {
  max-width: 46rem;
  margin-top: 3rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--devora-border);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.9rem;
}
`;

/** A scrollable, focusable code block (keyboard users can scroll it). */
export function Code({ children, label = "Code" }: { children: string; label?: string }) {
  return (
    <div className="post-code" role="region" aria-label={label} tabIndex={0}>
      <pre>{children}</pre>
    </div>
  );
}

export function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="post-note">
      <p><strong>{title}</strong></p>
      {children}
    </aside>
  );
}

export function BlogPost({ slug, children }: { slug: string; children: ReactNode }) {
  const post = findPost(slug);
  const url = `${SITE_URL}/blog/${slug}`;
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <style dangerouslySetInnerHTML={{ __html: BLOG_CSS }} />
      <article>
        <header className="post-header">
          <p className="post-byline">
            <a href="/blog">Blog</a>
            <span aria-hidden="true">·</span>
            {post.date ? <time dateTime={post.date}>{formatDate(post.date)}</time> : <span>{formatDate(post.date)}</span>}
            <span aria-hidden="true">·</span>
            <span>
              by <a href={AUTHOR.url}>{AUTHOR.name}</a>
            </span>
            <span aria-hidden="true">·</span>
            <span className="post-tags">
              {post.tags.map((t) => (
                <span className="post-tag" key={t}>{t}</span>
              ))}
            </span>
          </p>
          <h1>{post.title}</h1>
          <p className="devora-lead">{post.description}</p>
        </header>
        <div className="post-body">{children}</div>
        <footer className="post-footer">
          <a href="/blog">← All posts</a>
          <a href="/rss.xml">RSS feed</a>
        </footer>
      </article>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
            articleSection: post.tags[0],
            keywords: post.tags.join(", "),
            url,
            mainEntityOfPage: url,
            image: `${SITE_URL}/og/blog-${slug}.png`,
            inLanguage: "en",
            author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
            publisher: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Devora.js docs", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
        ]}
      />
    </PageShell>
  );
}
