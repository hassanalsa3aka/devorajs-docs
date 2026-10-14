import { PageShell } from "@devorajs/core";
import { DOCS_NAV } from "../nav.js";
import { SiteFooter } from "../site-footer.js";
import { JsonLd, pageMeta, SITE_URL } from "../seo.js";

export const renderMode = "ssg";

export function meta() {
  return pageMeta("/blog", {
    title: "Blog",
    description: "Release notes and design write-ups from the Devora.js project.",
    image: "/og/blog.png",
  });
}

export async function loader() {
  return {};
}

export default function Blog() {
  return (
    <PageShell nav={DOCS_NAV} footer={<SiteFooter />}>
      <h1>Blog</h1>
      <p className="devora-lead">
        Release notes and design write-ups from the Devora.js project — what changed, why, and what
        to do about it.
      </p>
      <div className="devora-card">
        <p style={{ margin: 0 }}>
          No posts yet. Until the first one is up, the{" "}
          <a href="https://github.com/hassanalsa3aka/devora.js/blob/main/CHANGELOG.md">CHANGELOG</a>{" "}
          has every release and <a href="/upgrading">Upgrading to 0.3.2</a> has what the latest one
          changes.
        </p>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Devora.js docs", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          ],
        }}
      />
    </PageShell>
  );
}
