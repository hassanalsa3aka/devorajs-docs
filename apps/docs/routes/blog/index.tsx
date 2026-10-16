import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../../nav.js";
import { SiteFooter } from "../../site-footer.js";
import { JsonLd, pageMeta, SITE_URL } from "../../seo.js";
import { AUTHOR, POSTS, TAGS, formatDate, tagId } from "../../blog-post.js";

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

// Filter by tag with no script: radio inputs and :has(), the same technique as the /compare filter.
const FILTER_CSS = TAGS.map(
  (t) => `.blog-page:has(#blog-tag-${tagId(t)}:checked) .blog-list li:not([data-tags~="${tagId(t)}"]) { display: none; }`
).join("\n");

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
        .devora-page .blog-page .blog-list { padding: 0; margin: 2rem 0 0; }
        .blog-filter { border: 0; padding: 0; margin: 1.25rem 0 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .blog-filter legend { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
        .blog-filter input { position: absolute; opacity: 0; width: 1px; height: 1px; }
        .blog-filter label { cursor: pointer; font-size: 0.85rem; font-weight: 600; padding: 0.35rem 0.9rem; border: 1px solid var(--devora-border); border-radius: 999px; color: var(--devora-fg-muted); background: var(--devora-card); }
        .blog-filter input:checked + label { color: var(--devora-fg); border-color: var(--devora-accent-from); }
        .blog-filter input:focus-visible + label { outline: 2px solid var(--devora-accent-from); outline-offset: 2px; }
        .blog-item-tags { display: flex; gap: 0.35rem; margin-top: 0.6rem; }
        .blog-item-tag { font-size: 0.72rem; font-weight: 700; padding: 0.1rem 0.55rem; border-radius: 999px; border: 1px solid var(--devora-border); color: var(--devora-fg-muted); }
        ${FILTER_CSS}
      ` }} />
      <div className="blog-page">
      <h1>Blog</h1>
      <p className="devora-lead">
        Release notes and design write-ups from the Devora.js project — what changed, why, and what
        to do about it.
      </p>
      <p className="blog-feed">
        <a href="/rss.xml">RSS feed</a> · Written by <a href={AUTHOR.url}>{AUTHOR.name}</a>
      </p>
      <fieldset className="blog-filter">
        <legend>Show posts tagged</legend>
        <input type="radio" name="blog-tag" id="blog-tag-all" defaultChecked />
        <label htmlFor="blog-tag-all">All</label>
        {TAGS.map((t) => (
          <span key={t} style={{ display: "contents" }}>
            <input type="radio" name="blog-tag" id={`blog-tag-${tagId(t)}`} />
            <label htmlFor={`blog-tag-${tagId(t)}`}>{t}</label>
          </span>
        ))}
      </fieldset>
      <ul className="blog-list">
        {POSTS.map((post) => (
          <li key={post.slug} data-tags={post.tags.map(tagId).join(" ")}>
            <a className="blog-item" href={`/blog/${post.slug}`}>
              {post.date ? <time dateTime={post.date}>{formatDate(post.date)}</time> : <time>{formatDate(post.date)}</time>}
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <span className="blog-item-tags">
                {post.tags.map((t) => (
                  <span className="blog-item-tag" key={t}>{t}</span>
                ))}
              </span>
            </a>
          </li>
        ))}
      </ul>
      </div>
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
            ...(p.date ? { datePublished: p.date } : {}),
            keywords: p.tags.join(", "),
            url: `${SITE_URL}/blog/${p.slug}`,
            author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
          })),
        }}
      />
    </PageShell>
  );
}
