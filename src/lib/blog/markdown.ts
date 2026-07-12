/** Lightweight markdown → safe HTML for blog articles (no external deps). */
export function renderBlogMarkdown(markdown: string): string {
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split(/\r?\n/);
  const html: string[] = [];
  let inUl = false;
  let inOl = false;
  let inQuote = false;
  let paragraph: string[] = [];

  function closeLists() {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  }

  function closeQuote() {
    if (inQuote) {
      html.push("</blockquote>");
      inQuote = false;
    }
  }

  function flushParagraph() {
    if (paragraph.length === 0) return;
    html.push(`<p>${formatInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      closeLists();
      closeQuote();
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      closeLists();
      if (!inQuote) {
        html.push("<blockquote>");
        inQuote = true;
      }
      html.push(`<p>${formatInline(trimmed.slice(2))}</p>`);
      continue;
    }
    closeQuote();

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      closeLists();
      html.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      closeLists();
      html.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushParagraph();
      closeLists();
      html.push(`<h2>${formatInline(trimmed.slice(2))}</h2>`);
      continue;
    }

    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        html.push("<ul>");
        inUl = true;
      }
      html.push(`<li>${formatInline(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        html.push("<ol>");
        inOl = true;
      }
      html.push(`<li>${formatInline(olMatch[1])}</li>`);
      continue;
    }

    closeLists();
    paragraph.push(trimmed);
  }

  flushParagraph();
  closeLists();
  closeQuote();
  return html.join("\n");
}

function formatInline(text: string) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>'
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/&lt;u&gt;(.+?)&lt;\/u&gt;/g, "<u>$1</u>");
}
