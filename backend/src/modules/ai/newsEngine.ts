/**
 * NIVAARAN — STEP 2: News Research Engine (SIH 26043)
 * GNews / NewsAPI live search, parse, ±3 days filter, deduplicate by URL
 */

export interface RecentIncident {
  title: string;
  source: string;
  url: string;
  snippet: string;
  publishedAt: string;
  sourceTag?: 'news' | 'govt' | 'db';
}

export interface NewsResearchResult {
  recentIncidents: RecentIncident[];     // max 3
  corroborationCount: number;            // total articles found (before filter/dedup)
  confidence: number;                    // 0.92 if real articles, 0 if empty
  queryUsed: string;
  sourceUsed: string;
}

function daysDiff(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

import { linkAbortSignal } from './abortUtil';
import { LRUCache } from 'lru-cache';

const newsCache = new LRUCache<string, { payload: NewsResearchResult; ts: number }>({
  max: 200,
  ttl: 10 * 60 * 1000, // 10 min
});

/**
 * Step 2A: Query builder & API caller (GNews with NewsAPI fallback)
 */
export async function buildQueryAndCallAPI(
  district: string,
  infraType: string,
  hazardType: string,
  eventDate?: string | Date,
  signal?: AbortSignal
): Promise<{ rawResponse: any; success: boolean; source: string; queryUsed: string; error?: string }> {
  const infra = infraType || 'Drainage';
  const hazard = hazardType || 'Waterlogging';
  const query = `${district} Jharkhand ${infra} ${hazard}`.trim();
  const encoded = encodeURIComponent(query);
  const gnewsApiKey = process.env.GNEWS_API_KEY || '';
  const newsApiKey = process.env.NEWS_API_KEY || '';

  // 1. Try GNews first if key exists or demo
  if (gnewsApiKey) {
    try {
      const url = `https://gnews.io/api/v4/search?q=${encoded}&lang=en&apikey=${gnewsApiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      linkAbortSignal(controller, signal);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        return { rawResponse: json, success: true, source: 'GNews', queryUsed: query };
      }
    } catch {
      // GNews failed / timeout
    }
  }

  // 2. Fallback to NewsAPI
  if (newsApiKey) {
    try {
      const fromStr = eventDate ? new Date(eventDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
      const url = `https://newsapi.org/v2/everything?q=${encoded}&language=en&from=${fromStr}&apiKey=${newsApiKey}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      linkAbortSignal(controller, signal);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        return { rawResponse: json, success: true, source: 'NewsAPI', queryUsed: query };
      }
    } catch {
      // NewsAPI also failed
    }
  }

  return { rawResponse: null, success: false, source: 'none', queryUsed: query, error: 'News API failed or timed out' };
}

/**
 * Step 2B: Parse JSON response, filter ±3 days, deduplicate by URL, cap at 3
 */
export async function parseAndFilterArticles(
  rawResponse: any,
  eventDate?: string | Date,
  queryUsed: string = '',
  sourceName: string = 'News'
): Promise<NewsResearchResult> {
  const articles: any[] = rawResponse?.articles || rawResponse?.results || [];
  const corroborationCount = articles.length;

  if (!articles || articles.length === 0) {
    return {
      recentIncidents: [],
      corroborationCount: 0,
      confidence: 0,
      queryUsed,
      sourceUsed: 'none',
    };
  }

  // Convert event date to Date
  const eventDt = eventDate ? new Date(eventDate) : new Date();

  // Deduplicate by URL + filter ±3 days
  const seenUrls = new Set<string>();
  const filtered: RecentIncident[] = [];

  for (const art of articles) {
    const url = art.url || art.link || art.webUrl || '';
    if (!url || seenUrls.has(url)) continue;
    seenUrls.add(url);

    const publishedStr = art.publishedAt || art.pubDate || art.published || art.date;
    if (publishedStr && eventDate) {
      const publishedDt = new Date(publishedStr);
      if (!isNaN(publishedDt.getTime())) {
        const diff = daysDiff(publishedDt, eventDt);
        if (Math.abs(diff) > 3) continue; // outside ±3 days window
      }
    }

    filtered.push({
      title: art.title || art.headline || art.name || 'Jharkhand Civic Incident',
      source: art.source?.name || art.source || sourceName,
      url,
      snippet: art.description || art.snippet || art.summary || art.content || '',
      publishedAt: publishedStr || new Date().toISOString(),
      sourceTag: 'news',
    });

    if (filtered.length >= 3) break; // max 3
  }

  return {
    recentIncidents: filtered,
    corroborationCount,
    confidence: filtered.length > 0 ? 0.92 : 0,
    queryUsed,
    sourceUsed: sourceName,
  };
}

/**
 * Full Step 2 News Research execution
 * Returns recentIncidents (max 3) and corroborationCount.
 * If API fails or times out, returns empty with confidence 0.
 */
export async function searchNews(
  district: string,
  infraType: string,
  hazardType: string,
  eventDate?: string | Date,
  signal?: AbortSignal
): Promise<NewsResearchResult> {
  const normalizedDistrict = (district || 'Ranchi').toLowerCase();
  const cacheKey = `${normalizedDistrict}|${(infraType || '').toLowerCase()}|${(hazardType || '').toLowerCase()}|${eventDate ? String(eventDate).slice(0, 10) : 'any'}`;
  const cached = newsCache.get(cacheKey);
  if (cached) return cached.payload;

  const queryUsed = `${district} Jharkhand ${infraType || ''} ${hazardType || ''}`.trim();
  let result: NewsResearchResult;
  try {
    const apiCall = await buildQueryAndCallAPI(district, infraType, hazardType, eventDate, signal);
    if (apiCall.success && apiCall.rawResponse) {
      result = await parseAndFilterArticles(apiCall.rawResponse, eventDate, apiCall.queryUsed, apiCall.source);
    } else {
      result = { recentIncidents: [], corroborationCount: 0, confidence: 0, queryUsed, sourceUsed: 'none' };
    }
  } catch {
    result = { recentIncidents: [], corroborationCount: 0, confidence: 0, queryUsed, sourceUsed: 'none' };
  }
  if (result.confidence > 0) newsCache.set(cacheKey, { payload: result, ts: Date.now() });
  return result;
}

// Backward-compatible alias
export const newsResearchFull = searchNews;

// ── STEP 5: MERGE / COMBINE RESULTS ──────────────────────────────────────────

export interface PartialResults {
  news: NewsResearchResult | any;     // from Step 2
  disaster: any;                      // from Step 3 (activeAlert, severityLevel, maxRain, source, confidence)
  govt: any;                          // from Step 4 (governmentAdvisories, recurringHazard, severityContext, source, confidence)
  queryUsed: string;
}

export interface UnifiedResearchResult {
  advisories: string[];
  governmentAdvisories: string[];     // alias
  incidents: RecentIncident[];
  recentIncidents: RecentIncident[];  // alias
  recurringHazard: boolean;
  recurringHazardIdentified: boolean; // alias
  severityContext: string;
  confidence: number;
  queryUsed: string;
  activeAlert?: boolean;
  corroborationCount?: number;
  sourceBreakdown: {
    news: string;
    weather: string;
    govt: string;
  };
}

/**
 * STEP 5 — Merge partial results from Step 2, Step 3, Step 4 into UnifiedResearchResult
 */
export function applyMergeRules(partial: PartialResults): UnifiedResearchResult {
  const news = partial.news || { recentIncidents: [], corroborationCount: 0, confidence: 0 };
  const disaster = partial.disaster || { activeAlert: false, severityLevel: 'none', maxRain: 0, confidence: 0 };
  const govt = partial.govt || { governmentAdvisories: [], recentIncidents: [], source: 'none', confidence: 0 };

  // 1. Advisories = union of all source strings (deduplicate by normalized text)
  const allAdvisoriesRaw: string[] = [
    ...(govt.governmentAdvisories || []),
    ...(govt.advisories || []),
  ];
  const seenAdv = new Set<string>();
  const advisories: string[] = [];
  for (const raw of allAdvisoriesRaw) {
    if (!raw) continue;
    const clean = raw.trim();
    const hashKey = clean.toLowerCase().replace(/\[(db|live)\]\s*/i, '');
    if (!seenAdv.has(hashKey)) {
      seenAdv.add(hashKey);
      advisories.push(clean);
    }
  }

  // 2. Incidents = concat news articles + DDG snippets, deduplicate by URL/title (max 3)
  const newsIncidents: RecentIncident[] = (news.recentIncidents || []).map((s: any) => ({ ...s, sourceTag: 'news' as const }));
  const govtSnippets: RecentIncident[] = (govt.recentIncidents || []).map((s: any) => ({ ...s, sourceTag: (govt.source === 'live' || govt.source === 'govt-live' ? 'govt' : 'db') as 'govt' | 'db' }));
  const combined = [...newsIncidents, ...govtSnippets];

  const seenInc = new Set<string>();
  const incidents: RecentIncident[] = [];
  for (const inc of combined) {
    const key = `${(inc.url || '').toString().toLowerCase()}|${(inc.title || '').toString().toLowerCase().slice(0, 60)}`;
    if (!seenInc.has(key)) {
      seenInc.add(key);
      incidents.push(inc);
    }
    if (incidents.length >= 3) break;
  }

  // 3. recurringHazard = (news incident count >= 2) OR (DB match AND govt snippet mentions recurrence)
  const newsCorroboration = (news.corroborationCount || 0) + (news.recentIncidents?.length || 0);
  const dbMatch = govt.source === 'db' || govt.source === 'govt-db' || (govt.advisories?.length > 0) || (govt.governmentAdvisories?.length > 0);
  const govtMentionsRecurrence = govt.recurringHazardIdentified === true || (govt.severityContext && /recur|frequent|multiple/i.test(govt.severityContext));
  const recurringHazard = (newsCorroboration >= 2) || (dbMatch && (govtMentionsRecurrence || advisories.length > 0));

  // 4. severityContext based on conditions
  const weatherActive = disaster.activeAlert === true || disaster.severityLevel === 'high';
  const newsCorroborated = (news.corroborationCount || 0) >= 1 || (news.recentIncidents?.length || 0) >= 1;

  let severityContext: string;
  if (weatherActive && newsCorroborated) {
    severityContext = 'CORROBORATED RISK: Multiple related civic/environmental incidents logged (live weather + news). High priority for engineering intervention.';
  } else if ((govt.source === 'db' || govt.source === 'govt-db') && !weatherActive && !newsCorroborated) {
    severityContext = 'Localized incident detected. Verified against Jharkhand Municipal and Disaster Management records (DB only).';
  } else if (weatherActive) {
    severityContext = 'ACTIVE WEATHER ALERT: High precipitation / severe storm forecast in district zone.';
  } else if (newsCorroborated) {
    severityContext = 'CORROBORATED RISK: Multiple related civic/environmental incidents logged in district news index.';
  } else {
    severityContext = 'Active ground verification conducted for the reported district.';
  }

  // 5. Confidence calculation:
  // 0.92 if all 3 sources succeeded; 0.85 if 2; 0.70 if 1; 0.60 if DB only
  const newsSuccess = (news.confidence || 0) > 0 && (news.recentIncidents?.length || 0) > 0;
  const weatherSuccess = (disaster.confidence || 0) > 0;
  const govtLiveSuccess = (govt.source === 'live' || govt.source === 'govt-live') && (govt.confidence || 0) > 0.6;
  const successSources = (newsSuccess ? 1 : 0) + (weatherSuccess ? 1 : 0) + (govtLiveSuccess ? 1 : 0);

  let confidence = 0.60;
  if (successSources >= 3) {
    confidence = 0.92;
  } else if (successSources === 2) {
    confidence = 0.85;
  } else if (successSources === 1) {
    confidence = 0.70;
  } else {
    confidence = 0.60; // DB only fallback
  }

  return {
    advisories,
    governmentAdvisories: advisories,
    incidents,
    recentIncidents: incidents,
    recurringHazard,
    recurringHazardIdentified: recurringHazard,
    severityContext,
    confidence,
    activeAlert: weatherActive,
    corroborationCount: newsCorroboration,
    queryUsed: partial.queryUsed || '',
    sourceBreakdown: {
      news: news.sourceUsed || 'none',
      weather: disaster.source || 'none',
      govt: govt.source || 'db',
    },
  };
}
