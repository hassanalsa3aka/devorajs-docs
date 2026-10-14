// Shared by the blog index, every post and scripts/build-rss.mjs (which
// reads data/blog-posts.json directly). A post route passes its slug; the
// title, date and description come from that one file, so the index, the
// post, its JSON-LD and /rss.xml can't disagree.
import type { ReactNode } from "react";
import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "./nav.js";
import { SiteFooter } from "./site-footer.js";
import { JsonLd, OG_IMAGE, SITE_URL, pageMeta } from "./seo.js";
import blog from "./data/blog-posts.json";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
}

export const AUTHOR = blog.author;
export const POSTS: PostMeta[] = [...blog.posts].sort((a, b) => b.date.localeCompare(a.date));

export function findPost(slug: string): PostMeta {
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`[blog] no post "${slug}" in data/blog-posts.json`);
  return post;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function postMeta(slug: string) {
  const post = findPost(slug);
  const meta = pageMeta(`/blog/${slug}`, { title: post.title, description: post.description, image: "/og/blog.png" });
  const feed = { rel: "alternate", href: "/rss.xml", type: "application/rss+xml", title: "Devora.js blog" };
  return { ...meta, head: { ...meta.head, links: [...meta.head.links, feed] } };
}

export const BLOG_CSS = `
.devora-page .post-header { margin-bottom: 2rem; }
.devora-page .post-header h1 { margin-bottom: 0.6rem; }
.post-byline { display: flex; flex-wrap: wrap; gap: 0.25rem 0.75rem; font-size: 0.875rem; color: var(--devora-fg-muted); }
.post-byline a { color: var(--devora-fg-muted); }
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
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>
              by <a href={AUTHOR.url}>{AUTHOR.name}</a>
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
            datePublished: post.date,
            dateModified: post.date,
            url,
            mainEntityOfPage: url,
            image: OG_IMAGE,
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
