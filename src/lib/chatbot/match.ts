/**
 * Knowledge-base matcher for the public chatbot.
 * Scores visitor messages against trained Q&A (EN + Bangla friendly).
 */

export type MatchableQa = {
  id: string;
  question: string;
  answer: string;
  aliases: string[];
  keywords: string[];
  category: string | null;
};

export type MatchResult = {
  qa: MatchableQa;
  score: number;
  /** 0–1 relative confidence used for thresholding */
  confidence: number;
};

/** Minimum score to accept a match (absolute). */
export const CHATBOT_MATCH_THRESHOLD = 0.28;

export const CHATBOT_FALLBACK_ANSWER =
  "Thanks for your question! I don’t have a trained answer for that yet. Please visit our Contact page or WhatsApp us — our team will help you shortly. You can also browse Shop / Product List anytime.";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "am",
  "do",
  "does",
  "did",
  "can",
  "could",
  "will",
  "would",
  "should",
  "i",
  "you",
  "we",
  "my",
  "your",
  "me",
  "to",
  "of",
  "for",
  "in",
  "on",
  "at",
  "and",
  "or",
  "what",
  "how",
  "when",
  "where",
  "why",
  "which",
  "about",
  "with",
  "from",
  "have",
  "has",
  "please",
  "ki",
  "kivabe",
  "koto",
  "ache",
  "asen",
  "ami",
  "apni",
  "er",
  "ei",
  "ota",
  "এই",
  "কি",
  "কী",
  "কীভাবে",
  "কত",
  "আছে",
  "আমি",
  "আপনি",
  "এর",
  "এবং",
  "না",
  "হয়",
]);

export function normalizeChatText(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeChatText(raw: string): string[] {
  const normalized = normalizeChatText(raw);
  if (!normalized) return [];
  return normalized
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function includesScore(haystack: string, needle: string) {
  if (!haystack || !needle) return 0;
  if (haystack === needle) return 1;
  if (haystack.includes(needle) || needle.includes(haystack)) {
    const shorter = Math.min(haystack.length, needle.length);
    const longer = Math.max(haystack.length, needle.length);
    return 0.55 + (shorter / longer) * 0.35;
  }
  return 0;
}

export function scoreQaAgainstMessage(message: string, qa: MatchableQa): number {
  const msgNorm = normalizeChatText(message);
  const msgTokens = new Set(tokenizeChatText(message));
  if (!msgNorm) return 0;

  const questionNorm = normalizeChatText(qa.question);
  const aliasNorms = qa.aliases.map(normalizeChatText).filter(Boolean);
  const keywordNorms = qa.keywords.map(normalizeChatText).filter(Boolean);

  let score = 0;

  // Exact / near question match
  score += includesScore(msgNorm, questionNorm) * 0.55;

  // Best alias match
  let bestAlias = 0;
  for (const alias of aliasNorms) {
    bestAlias = Math.max(bestAlias, includesScore(msgNorm, alias));
  }
  score += bestAlias * 0.45;

  // Keyword hits
  if (keywordNorms.length > 0) {
    let hits = 0;
    for (const kw of keywordNorms) {
      if (!kw) continue;
      if (msgNorm.includes(kw) || msgTokens.has(kw)) hits += 1;
      else {
        // partial token contain
        for (const t of msgTokens) {
          if (t.includes(kw) || kw.includes(t)) {
            hits += 0.6;
            break;
          }
        }
      }
    }
    score += Math.min(1, hits / Math.max(1, keywordNorms.length)) * 0.5;
  }

  // Token overlap vs question + aliases + keywords
  const bankTokens = new Set([
    ...tokenizeChatText(qa.question),
    ...qa.aliases.flatMap((a) => tokenizeChatText(a)),
    ...qa.keywords.flatMap((k) => tokenizeChatText(k)),
  ]);
  score += jaccard(msgTokens, bankTokens) * 0.4;

  return score;
}

export function findBestQaMatch(
  message: string,
  items: MatchableQa[],
  threshold = CHATBOT_MATCH_THRESHOLD
): MatchResult | null {
  let best: MatchResult | null = null;

  for (const qa of items) {
    const score = scoreQaAgainstMessage(message, qa);
    if (!best || score > best.score) {
      best = { qa, score, confidence: Math.min(1, score) };
    }
  }

  if (!best || best.score < threshold) return null;
  return best;
}
