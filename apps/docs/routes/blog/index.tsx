import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../../nav.js";
import { SiteFooter } from "../../site-footer.js";
import { JsonLd, pageMeta, SITE_URL } from "../../seo.js";
import { AUTHOR, POSTS, formatDate } from "../../blog-post.js";

export const renderMode = "ssg";

export function meta() {
  const m = pageMeta("/blog", {
    title: "Blog",
    description: "Release notes and design write-ups from the Devora.js project.",
    image: "/og/blog.png",
  });
  const feed = { rel: "alternate", href: "/rss.xml", type: "application/rss+xml", title: "Devora.js blog" };
  return { ...m, head: { ...m.head, links: [...m.head.links, feed] } };
}

export async function loader() {
  return {};
}

export default function Blog() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-list { list-style: none; margin: 2rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 1rem; max-width: 46rem; }
        .devora-page .blog-list li { margin: 0; }
        .blog-item {
          display: block;
          padding: 1.25rem 1.4rem;
          border: 1px solid var(--devora-border);
          border-radius: var(--devora-radius-lg);
          background: var(--devora-card);
          text-decoration: none;
          transition: border-color 0.15s ease;
        }
        .blog-item:hover { border-color: var(--devora-accent-from); }
        .blog-item time { font-size: 0.8rem; color: var(--devora-fg-muted); }
        .devora-page .blog-item h2 { margin: 0.3rem 0 0.4rem; padding: 0; font-size: 1.15rem; color: var(--devora-fg); }
        .devora-page .blog-item h2::before { content: none; }
        .devora-page .blog-item p { margin: 0; font-size: 0.92rem; }
        .blog-feed { font-size: 0.875rem; }
      ` }} />
      <h1>Blog</h1>
      <p className="devora-lead">
        Release notes and design write-ups from the Devora.js project — what changed, why, and what
        to do about it.
      </p>
      <p className="blog-feed">
        <a href="/rss.xml">RSS feed</a> · Written by <a href={AUTHOR.url}>{AUTHOR.name}</a>
      </p>
      <ul className="blog-list">
        {POSTS.map((post) => (
          <li key={post.slug}>
            <a className="blog-item" href={`/blog/${post.slug}`}>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
            </a>
          </li>
        ))}
      </ul>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Devora.js blog",
          url: `${SITE_URL}/blog`,
          inLanguage: "en",
          blogPost: POSTS.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            datePublished: p.date,
            url: `${SITE_URL}/blog/${p.slug}`,
            author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
          })),
        }}
      />
    </PageShell>
  );
}
