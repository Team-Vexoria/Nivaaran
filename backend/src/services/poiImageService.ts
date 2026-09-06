// @ts-nocheck
export interface POI {
  id?: string;
  name: string;
  city?: string;
  location?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  imageSource?: 'wikidata_p18' | 'wikipedia_canonical' | 'wikimedia_commons' | 'google_places' | 'fallback';
  imageAttribution?: string;
}

interface CachedImageResult {
  imageUrl: string;
  source: 'wikidata_p18' | 'wikipedia_canonical' | 'wikimedia_commons' | 'google_places' | 'fallback';
  attribution?: string;
  timestamp: number;
}

const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
export const imageCache = new Map<string, CachedImageResult>();

export function clearCache(): void {
  imageCache.clear();
}

export function getCacheKey(name: string, location?: string): string {
  return `${name.trim().toLowerCase()}|${(location || '').trim().toLowerCase()}`;
}

const USER_AGENT = 'LokivaTravelApp/2.0 (contact@lokiva.com)';

// ── QUERY CANDIDATE GENERATION ────────────────────────────────────────────────
export function generateSearchCandidates(name: string, city?: string): string[] {
  const candidates: string[] = [];
  const raw = name.trim();

  // 1. Extract content inside parentheses e.g. "Golden Temple (Harmandir Sahib)" -> "Harmandir Sahib"
  const bracketMatches = raw.match(/\(([^)]+)\)/g);
  const insideBrackets: string[] = [];
  if (bracketMatches) {
    for (const b of bracketMatches) {
      const inner = b.replace(/[()]/g, '').trim();
      if (inner.length > 2) insideBrackets.push(inner);
    }
  }

  // 2. Strip parentheses and trailing extra details e.g. "Golden Temple (Harmandir Sahib)" -> "Golden Temple"
  const cleanBase = raw.replace(/\s*\([^)]*\)/g, '').trim();

  // 3. Strip connecting prepositions e.g. "Partition Museum at Town Hall" -> "Partition Museum"
  const connectorParts = cleanBase.split(/\s+(?:at|in|near|on|inside|by|adjacent to)\s+/i);
  const primaryPart = connectorParts[0]?.trim();

  // 4. Strip redundant landmark suffixes for secondary candidate search e.g. "Jallianwala Bagh National Memorial" -> "Jallianwala Bagh"
  const strippedSuffix = cleanBase.replace(/\s+(?:National Memorial|Historical Memorial|Memorial|National Monument|Monument|Heritage Site|Historical Site)$/i, '').trim();

  if (primaryPart && primaryPart !== raw) candidates.push(primaryPart);
  if (strippedSuffix && strippedSuffix !== raw && strippedSuffix !== primaryPart) candidates.push(strippedSuffix);
  if (cleanBase && !candidates.includes(cleanBase)) candidates.push(cleanBase);

  for (const inner of insideBrackets) {
    if (!candidates.includes(inner)) candidates.push(inner);
  }

  if (!candidates.includes(raw)) candidates.push(raw);

  if (city && city.trim()) {
    const cleanCity = city.trim();
    const cityCandidates: string[] = [];
    for (const c of candidates) {
      if (!c.toLowerCase().includes(cleanCity.toLowerCase())) {
        cityCandidates.push(`${c} ${cleanCity}`);
      }
    }
    candidates.push(...cityCandidates);
  }

  return candidates;
}

// ── ENTITY & TITLE RELEVANCE VALIDATION ────────────────────────────────────────
const DISALLOWED_ENTITY_DESCRIPTIONS = [
  'disambiguation page',
  'topics referred to by the same term',
  'act of parliament',
  'act of the parliament',
  'act of congress',
  'legislation',
  'statutory instrument',
  'bill of parliament',
  'documentary film',
  'short film',
  'feature film',
  'television series',
  'television episode',
  'fictional character',
  'fictional entity',
  'musical group',
  'soundtrack album',
  'studio album',
  'single by',
  'scientific article',
  'scholarly article',
  'wikimedia template',
  'wikimedia list article',
  'wikimedia category',
  'family name',
  'given name',
];

export function isRelevantWikidataEntity(entity: any, targetName: string, targetCity?: string): boolean {
  if (!entity || !entity.label) return false;

  const desc = (entity.description || '').toLowerCase();
  for (const disallowed of DISALLOWED_ENTITY_DESCRIPTIONS) {
    if (desc.includes(disallowed)) return false;
  }

  const cleanLabel = entity.label.toLowerCase().replace(/_/g, ' ').trim();
  const cleanTarget = targetName.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim();

  if (cleanLabel === cleanTarget) return true;

  const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'near', 'inside', 'gate', 'road', 'street', 'hall']);
  const targetWords = cleanTarget.split(/[^a-z0-9]+/i).filter((w) => w.length > 2 && !stopWords.has(w));
  
  if (targetWords.length === 0) return true;
// @ts-ignore

  const labelWords = cleanLabel.split(/[^a-z0-9]+/i).filter((w) => w.length > 2);
  const matchedWords = targetWords.filter((w) => labelWords.some((lw) => lw.includes(w) || w.includes(lw)));

  const overlapRatio = matchedWords.length / targetWords.length;
  if (overlapRatio >= 0.65) return true;

  if (Array.isArray(entity.aliases)) {
    for (const alias of entity.aliases) {
      const cleanAlias = (typeof alias === 'string' ? alias : alias?.value || '').toLowerCase();
      if (cleanAlias === cleanTarget) return true;
      const aliasWords = cleanAlias.split(/[^a-z0-9]+/i).filter((w: string) => w.length > 2);
      const aliasMatches = targetWords.filter((w) => aliasWords.some((aw: string) => aw.includes(w) || w.includes(aw)));
      if (aliasMatches.length / targetWords.length >= 0.75) return true;
    }
  }

  if (targetCity && desc.includes(targetCity.toLowerCase()) && matchedWords.length >= 1) {
    return true;
  }

  return false;
}

export function isRelevantTitle(foundTitle: string, targetName: string, targetCity?: string): boolean {
  const cleanFound = foundTitle.toLowerCase().replace(/^file:/i, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' ').trim();
  const cleanTarget = targetName.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim();

  if (cleanFound === cleanTarget) return true;

  const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'near', 'inside', 'gate', 'road', 'street', 'hall', 'photo', 'image', 'picture']);
  const targetWords = cleanTarget.split(/[^a-z0-9]+/i).filter((w) => w.length > 2 && !stopWords.has(w));

  if (targetWords.length === 0) return true;

  const foundWords = cleanFound.split(/[^a-z0-9]+/i).filter((w) => w.length > 2);
  const matchedWords = targetWords.filter((w) => foundWords.some((fw) => fw.includes(w) || w.includes(fw)));

  const ratio = matchedWords.length / targetWords.length;
  if (ratio >= 0.65) return true;

  if (targetCity && cleanFound.includes(targetCity.toLowerCase()) && matchedWords.length >= 1) {
    return true;
  }

  return false;
}

// ── DIRECT MEDIAWIKI IMAGEINFO RESOLVER (Fixes 400 Bad Request) ───────────────
export async function fetchCommonsDirectUrl(fileName: string): Promise<string | null> {
  try {
    const rawFile = fileName.trim();
    const formattedTitle = rawFile.startsWith('File:') ? rawFile : `File:${rawFile}`;
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(formattedTitle)}&prop=imageinfo&iiprop=url|size&iiurlwidth=1200&format=json&origin=*`;

    const res = await fetch(apiUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;

    const data = (await res.json()) as any;
    const pages = data?.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') return null;

    const imageInfo = pages[pageId]?.imageinfo?.[0];
    if (!imageInfo) return null;

    return imageInfo.thumburl || imageInfo.url || null;
  } catch (err) {
    console.warn(`[Direct Commons ImageInfo Error for "${fileName}"]:`, (err as Error).message);
    return null;
  }
}

// ── METHOD 1: Wikidata Official P18 Representative Photograph ───────────────
async function fetchFromWikidataP18(name: string, city?: string): Promise<{ url: string; attribution: string } | null> {
  try {
    const candidates = generateSearchCandidates(name, city);

    for (const candidate of candidates) {
      const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(candidate)}&language=en&format=json&limit=6&origin=*`;
      const res = await fetch(searchUrl, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) continue;

      const data = (await res.json()) as any;
      const searchResults = data?.search;
      if (!searchResults || !Array.isArray(searchResults) || searchResults.length === 0) continue;

      // Find strictly relevant entity matching POI
      const matchedEntity = searchResults.find((item: any) => isRelevantWikidataEntity(item, name, city));
      if (!matchedEntity?.id) continue;

      // Fetch P18 image claim for the verified entity
      const claimsUrl = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${matchedEntity.id}&property=P18&format=json&origin=*`;
      const claimsRes = await fetch(claimsUrl, { headers: { 'User-Agent': USER_AGENT } });
      if (!claimsRes.ok) continue;

      const claimsData = (await claimsRes.json()) as any;
      const p18Claims = claimsData?.claims?.P18;

      if (p18Claims && p18Claims.length > 0) {
        const fileName = p18Claims[0]?.mainsnak?.datavalue?.value;
        if (fileName && typeof fileName === 'string') {
          // Resolve direct reliable CDN URL through Wikimedia imageinfo (Fixes 400 Bad Request)
          const directUrl = await fetchCommonsDirectUrl(fileName);
          if (directUrl) {
            return {
              url: directUrl,
              attribution: `Official Wikidata Photo (${matchedEntity.label || name})`,
            };
          }
        }
      }
    }
    return null;
  } catch (err) {
    console.warn(`[Wikidata P18 Error for "${name}"]:`, (err as Error).message);
    return null;
  }
}

// ── METHOD 2: Wikipedia Canonical Article Direct Page Image ──────────────────
async function fetchFromWikipediaCanonical(name: string, city?: string): Promise<{ url: string; attribution: string } | null> {
  try {
    const candidates = generateSearchCandidates(name, city);

    for (const candidate of candidates) {
      // 1. Try Wikipedia Generator CirrusSearch (Smart synonym & redirect resolution)
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(candidate)}&gsrlimit=5&prop=pageimages|pageprops|description&pithumbsize=1200&format=json&origin=*`;
      const res = await fetch(searchUrl, { headers: { 'User-Agent': USER_AGENT } });
      
      if (res.ok) {
        const data = (await res.json()) as any;
        const pages = data?.query?.pages;

        if (pages) {
          for (const pageId of Object.keys(pages)) {
            const page = pages[pageId];
            if (!page || page.pageprops?.disambiguation !== undefined) continue;

            const desc = (page.description || '').toLowerCase();
            if (desc.includes('disambiguation') || desc.includes('topics referred to by the same term')) continue;

            if (isRelevantTitle(page.title || '', name, city)) {
              const photoUrl = page.thumbnail?.source || page.original?.source;
              if (photoUrl) {
                return {
                  url: photoUrl,
                  attribution: `Wikipedia (${page.title})`,
                };
              }
            }
          }
        }
      }

      // 2. Direct exact title lookup
      const directUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(candidate)}&prop=pageimages|pageprops&redirects=1&pithumbsize=1200&format=json&origin=*`;
      const directRes = await fetch(directUrl, { headers: { 'User-Agent': USER_AGENT } });
      
      if (directRes.ok) {
        const directData = (await directRes.json()) as any;
        const pages = directData?.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId && pageId !== '-1') {
            const page = pages[pageId];
            if (page?.pageprops?.disambiguation === undefined && isRelevantTitle(page.title || '', name, city)) {
              const photoUrl = page.thumbnail?.source || page.original?.source;
              if (photoUrl) {
                return {
                  url: photoUrl,
                  attribution: `Wikipedia Canonical (${page.title})`,
                };
              }
            }
          }
        }
      }
    }

    return null;
  } catch (err) {
    console.warn(`[Wikipedia Canonical Error for "${name}"]:`, (err as Error).message);
    return null;
  }
}

// ── METHOD 3: Wikimedia Commons Scoped Landmark Search ───────────────────────
async function fetchFromWikimediaCommons(name: string, city?: string): Promise<{ url: string; attribution: string } | null> {
  try {
    const candidates = generateSearchCandidates(name, city);
    const skipTerms = ['flag', 'map', 'icon', 'logo', 'seal', 'diagram', 'coat_of_arms', 'symbol', '.pdf', '.djvu', '.svg'];

    for (const candidate of candidates) {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(candidate)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|size&iiurlwidth=1200&format=json&origin=*`;

      const res = await fetch(searchUrl, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) continue;

      const data = (await res.json()) as any;
      const pages = data?.query?.pages;
      if (!pages) continue;

      for (const key of Object.keys(pages)) {
        const page = pages[key];
        const lowerTitle = (page.title || '').toLowerCase();

        // Skip non-photograph media types
        if (skipTerms.some((term) => lowerTitle.includes(term))) continue;

        if (!isRelevantTitle(page.title || '', name, city)) continue;

        const imageInfo = page.imageinfo?.[0];
        const photoUrl = imageInfo?.thumburl || imageInfo?.url;
        if (photoUrl && imageInfo.width && imageInfo.width >= 400) {
          const cleanTitle = page.title.replace(/^File:/i, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
          return {
            url: photoUrl,
            attribution: `Wikimedia Commons (${cleanTitle})`,
          };
        }
      }
    }

    return null;
  } catch (err) {
    console.warn(`[Wikimedia Commons Error for "${name}"]:`, (err as Error).message);
    return null;
  }
}


// ── METHOD 4: Google Places API (New) (Optional Verified Place Match) ───────
async function fetchFromGooglePlaces(name: string, city?: string): Promise<{ url: string; attribution: string } | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;
  try {
    const textQuery = city ? `${name}, ${city}` : name;
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.photos',
      },
      body: JSON.stringify({ textQuery, maxResultCount: 1 }),
    });
    if (!res.ok) return null;
    const resData = (await res.json()) as any;
    const place = resData?.places?.[0];
    const photo = place?.photos?.[0];
    if (!photo || !photo.name) return null;

    const photoUri = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=1200&maxWidthPx=1600&key=${apiKey}`;
    const author = photo.authorAttributions?.[0]?.displayName || 'Google Maps';
    return { url: photoUri, attribution: `Official Place Photo via ${author}` };
  } catch (err) {
    console.warn(`[Google Places Error for "${name}"]:`, (err as Error).message);
    return null;
  }
}

// ── MAIN EXACT RESOLVER ───────────────────────────────────────────────────────
export async function resolveExactPOIImage(poi: POI): Promise<POI> {
  if (poi.imageUrl && !poi.imageUrl.includes('placeholder') && !poi.imageUrl.includes('generic')) {
    return poi;
  }

  const cacheKey = getCacheKey(poi.name, poi.city || poi.location);
  const now = Date.now();

  if (imageCache.has(cacheKey)) {
    const cached = imageCache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL_MS) {
      return {
        ...poi,
        imageUrl: cached.imageUrl,
        imageSource: cached.source,
        imageAttribution: cached.attribution,
      };
    }
  }

  // Strict Tier 1: Wikidata P18 (Curated canonical landmark entity photo)
  let result = await fetchFromWikidataP18(poi.name, poi.city || poi.location);
  let source: POI['imageSource'] = 'wikidata_p18';

  // Strict Tier 2: Wikipedia Direct Canonical Page Image
  if (!result) {
    result = await fetchFromWikipediaCanonical(poi.name, poi.city || poi.location);
    source = 'wikipedia_canonical';
  }

  // Strict Tier 3: Wikimedia Commons File Scoped Search
  if (!result) {
    result = await fetchFromWikimediaCommons(poi.name, poi.city || poi.location);
    source = 'wikimedia_commons';
  }

  // Strict Tier 4: Google Places API (if configured)
  if (!result) {
    result = await fetchFromGooglePlaces(poi.name, poi.city || poi.location);
    source = 'google_places';
  }

  const finalImageUrl = result ? result.url : undefined;
  const finalSource = result ? source : 'fallback';
  const finalAttribution = result ? result.attribution : undefined;

  if (result) {
    imageCache.set(cacheKey, {
      imageUrl: result.url,
      source: finalSource,
      attribution: finalAttribution,
      timestamp: now,
    });
  }

  return {
    ...poi,
    imageUrl: finalImageUrl,
    imageSource: finalSource,
    imageAttribution: finalAttribution,
  };
}

export const resolvePOIImage = resolveExactPOIImage;

export async function enrichPOIsWithImages(pois: POI[], concurrencyLimit = 5): Promise<POI[]> {
  const results: POI[] = [];
  for (let i = 0; i < pois.length; i += concurrencyLimit) {
    const chunk = pois.slice(i, i + concurrencyLimit);
    const resolvedChunk = await Promise.all(chunk.map((poi) => resolveExactPOIImage(poi)));
    results.push(...resolvedChunk);
  }
  return results;
}

