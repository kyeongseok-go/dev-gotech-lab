import { getPublishedBlogs } from "@/lib/content";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { CARD_NEWS_DATA } from "@/app/card-news/page";
import { toCardView } from "@/lib/card-news";

/** RSS 에 넣을 최근 카드뉴스 수 (피드 크기 제한) */
const RSS_CARD_LIMIT = 30;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = getPublishedBlogs();

  const blogEntries = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = new Date(post.date).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>${
        post.description
          ? `\n      <description>${escapeXml(post.description)}</description>`
          : ""
      }${
        post.category
          ? `\n      <category>${escapeXml(post.category)}</category>`
          : ""
      }
    </item>`;
    });

  // 카드뉴스: 원문 발췌(짧게) + 출처 표기, 링크는 사이트 상세 페이지
  const cardEntries = CARD_NEWS_DATA.slice(0, RSS_CARD_LIMIT).map((item) => {
    const card = toCardView(item);
    const link = `${SITE_URL}/card-news/${card.id}`;
    const source = card.source ? ` (출처: ${card.source.name})` : "";
    return `    <item>
      <title>${escapeXml(`[카드뉴스] ${card.title}`)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(card.created_at).toUTCString()}</pubDate>
      <description>${escapeXml(`원문 발췌: ${card.excerpt}${source}`)}</description>
      <category>카드뉴스</category>
    </item>`;
  });

  // 날짜 내림차순으로 합친다 (pubDate 문자열 대신 원본 날짜로 정렬)
  const dated = [
    ...posts.map((p, i) => ({ date: p.date, xml: blogEntries[i] })),
    ...CARD_NEWS_DATA.slice(0, RSS_CARD_LIMIT).map((c, i) => ({ date: c.created_at, xml: cardEntries[i] })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const items = dated.map((d) => d.xml).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
