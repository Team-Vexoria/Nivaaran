# Nivaaran — GIS Architecture

**Project:** Nivaaran — Smart Societal Innovation Platform
**Problem Statement:** SIH 26043
**Document:** GIS Architecture
**Status:** Foundational Architecture — Design for Production / Shipping
**Upstream documents:** `System_architecture.md` (§15 GIS Architecture), `BACKEND_ARCHITECTURE.md` (§3 PostGIS, §10 Data Layer), `DATABASE_DESIGN.md` (§10 PostGIS & GIS Columns), `Actors_and_roles.md` (§20 geographic scope), `API_CONTRACTS.md` (§15 District / GIS endpoints)

---

## 1. Purpose

This document specifies how Nivaaran uses GIS as a **first-class spatial subsystem** — not a bolted-on map widget, but a core capability that enables spatial challenge assignment, district/block filtering, heatmap analytics, geographic clustering, and the rural/remote context that defines Jharkhand's 24 districts. It turns:

* `System_architecture.md` §15 (GIS as first-class subsystem: points, boundaries, heatmaps, clusters, disaster layers, spatial relationships)
* `DATABASE_DESIGN.md` §10 (PostGIS schema, `Unsupported("geometry(Point,4326)")` columns, GiST indexes, district/block boundary models)
* `API_CONTRACTS.md` §15 (District/GIS endpoints: list, detail, spatial query, heatmap)

into a concrete, shippable design covering:

* the **PostGIS schema** — columns, indexes, raw migration;
* **boundary data sources** — Survey of India / NIC for production; 24-district GeoJSON for demo;
* the **geocoding provider interface** — lightweight, offline-first for MVP;
* **spatial query patterns** — bounding box, point-in-polygon, distance, clustering;
* **server-side heatmap / point-clustering** — what the API returns;
* the **Leaflet frontend integration contract** — what the API renders vs what the map renders;
* the **24 Jharkhand districts** as the geographic scope.

The design decision inherited from the stack (`BACKEND_ARCHITECTURE.md` §3, `DATABASE_DESIGN.md` §10):

> **All spatial data lives in PostGIS inside the primary Postgres database.**
> There is no second geo store. PostGIS is the single home for boundaries, points, and spatial queries.

---

## 2. Design Principles

1. **PostGIS is the source of truth.** No boundary data lives in JSON files on the server or frontend at runtime. The demo seeds it; production imports it. The application reads only from the DB (`DATABASE_DESIGN.md` §10).
2. **Prisma owns the relational schema; raw SQL owns the geometry.** All `ST_*` queries use `$queryRaw` with bound parameters; the `Unsupported("geometry(...)")` columns are Prima's deliberate pass-through — pragmatic, not accidental (`DATABASE_DESIGN.md` §10.1).
3. **Spatial queries are index-backed.** Every bounding box, point-in-polygon, and distance query uses a GiST index on the relevant geometry column (`idx_challenges_location_gist`, `idx_districts_boundary_gist`, `idx_blocks_boundary_gist`).
4. **Geocoding is optional at submit time.** A citizen may provide a GPS pin or just a district/block name. The system backfills coordinates where possible; a missing pin does not block submission (`Actors_and_roles.md` §20 — geographic scope is administrative, not GPS-precise).
5. **Heatmap is server-computed.** Client-side clustering of hundreds/thousands of points is fragile and mobile-hostile. The server returns pre-aggregated data per district/block; the map renders tiles.
6. **Boundary data is conservative on production rights.** Survey of India / NIC data has licensing constraints — never assumed freely redistributable. Production use is behind an official data-sharing agreement; the architecture separates data source from data representation.

---

## 3. PostGIS Schema

### 3.1 Setup (one-time, raw migration)

```sql
-- run once via prisma migrate (raw SQL migration in migrations/)
CREATE EXTENSION IF NOT EXISTS postgis;
-- verify: SELECT postgis_version();
```

PostGIS is a `CREATE EXTENSION`, not a Prisma `datasource.extension`, because Prisma does not manage `geometry` types natively. This is a deliberate, documented exception (`DATABASE_DESIGN.md` §10.1).

### 3.2 Spatial columns (the opaque pass-through)

| Table | Column | Type | Notes |
| --- | --- | --- | --- |
| `challenges` | `location` | `geometry(Point,4326)` | nullable; citizen GPS pin or geocoded district centroid |
| `districts` | `boundary` | `geometry(MultiPolygon,4326)` | full district polygon (WGS84) |
| `districts` | `centroid` | `geometry(Point,4326)` | district centroid for fast index-miss fallback |
| `blocks` | `boundary` | `geometry(MultiPolygon,4326)` | block-level polygon |

These are declared in `schema.prisma` as:
```prisma
location      Unsupported("geometry(Point,4326)")?
boundary      Unsupported("geometry(MultiPolygon,4326)")?
centroid      Unsupported("geometry(Point,4326)")?
```
`Unsupported(...)` means Prisma passes the column through untouched; it is read/written exclusively via `$queryRaw` with explicit `ST_AsGeoJSON(...)`, `ST_SetSRID(ST_MakePoint(...), 4326)`, etc.

### 3.3 Spatial indexes (GiST, raw migration)

```sql
CREATE INDEX idx_challenges_location_gist
  ON challenges USING gist (location);

CREATE INDEX idx_districts_boundary_gist
  ON districts USING gist (boundary);

CREATE INDEX idx_blocks_boundary_gist
  ON blocks USING gist (boundary);
```

GiST indexes support all core PostGIS operations: bounding-box overlap (`&&`), `ST_Contains`, `ST_Within`, `ST_DWithin`, `ST_Intersects`. Without these, every spatial query degenerates to a sequential scan — unusable beyond a few thousand rows.

### 3.4 The `Challenge.location` lifecycle

| Stage | Location state |
| --- | --- |
| Citizen submit (no GPS) | `location = NULL`; `district_code`/`block_code` filled from dropdown or text input |
| Citizen submit (with GPS) | `location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)`; district/block auto-attributed by point-in-polygon (§5.2) |
| Admin/manual correction | `location` updated via transition or admin patch; district/block re-attributed |
| AI vision (EXIF GPS) | `location` backfilled from `challenge_evidence.meta.gps` if `location IS NULL` |

A challenge without a location is **not blocked** — it enters the pipeline with district/block from the form. PostGIS enriches it, but the absence of a GPS pin is not a hard error. This keeps the platform accessible to low-connectivity and non-GPS devices.

---

## 4. Boundary Data Sources

### 4.1 Demo/development (permitted, redistributable)

| Level | Source | Resolution | Format |
| --- | --- | --- | --- |
| 24 Districts | the existing `JHARKHAND_DISTRICT_CENTROIDS` in `mapDataService.ts`, expanded to full GeoJSON polygons | low–medium (simplified) | GeoJSON → `ST_GeomFromGeoJSON(...)` |
| Blocks | extracted from open OSM-derived district breakdowns | medium | GeoJSON |

The demo seed (`seed:demo`) reads a `boundaries/` directory of GeoJSON files (one per district; optionally one per block) and inserts them into `districts`/`blocks` via raw SQL:
```sql
INSERT INTO districts (code, name, state_code, boundary, centroid)
VALUES ($1, $2, 'JH',
  ST_SetSRID(ST_GeomFromGeoJSON($3), 4326),
  ST_Centroid(ST_SetSRID(ST_GeomFromGeoJSON($3), 4326))
)
ON CONFLICT (code) DO UPDATE
  SET boundary = EXCLUDED.boundary, centroid = EXCLUDED.centroid;
```

### 4.2 Production (official, licensure required)

| Level | Source | Notes |
| --- | --- | --- |
| 24 Districts | Survey of India (SoI) / National Informatics Centre (NIC) official boundary files | Requires a data-sharing agreement with the Jharkhand state GIS cell or SoI |
| Blocks | SoI / NIC block-level shapefiles | Same licensure |
| Villages (optional future) | SoI cadastral / LSGD village shapefiles | Phase 2+; not required for the core 16-stage lifecycle |

**How to switch from demo → production:** a config key (`gis.boundary_source = "seed-files" | "production-soi"`) in `app_config`. The seed/import script is the same code path — the difference is the source directory and the license flag. Production data is imported into the same `districts`/`blocks` tables via the same raw-SQL upsert.

> **Important:** OpenStreetMap-derived boundaries (e.g. from ots.eo maps or similar) may be used for development, but official deployment in a government context should use SoI/NIC authoritative boundaries. The architecture supports both without code changes — only data changes.

---

## 5. Spatial Queries (all server-side, `$queryRaw`)

Every spatial query uses bound parameters — no user-supplied geometry strings are interpolated. This is both a correctness and security practice (T11 in `SECURITY_ARCHITECTURE.md`).

### 5.1 Bounding-box filter (map viewport)

The most common GIS query: "show me challenges in the current map view."

```sql
-- :west, :south, :east, :north are bound as floats (±180/±90)
SELECT c.id, c.title, c.category, c.priority_score, c.status,
       ST_AsGeoJSON(c.location)::json AS location
FROM challenges c
WHERE c.location IS NOT NULL
  AND c.deleted_at IS NULL
  AND c.location && ST_MakeEnvelope(:west, :south, :east, :north, 4326)
ORDER BY c.priority_score DESC NULLS LAST
LIMIT 200;
```

Uses `idx_challenges_location_gist`. The `&&` (bounding box overlap) operator is the fastest spatial filter in PostGIS — it uses the GiST index for the MBR test before any expensive geometry computation.

### 5.2 Point-in-polygon (district/block attribution)

When a challenge is submitted with GPS coordinates, or when a challenge needs to be attributed to its district/block:

```sql
-- attribute a challenge to its district (run at submission or as a backfill job)
UPDATE challenges
SET district_code = (
  SELECT d.code FROM districts d
  WHERE d.boundary IS NOT NULL
    AND ST_Contains(d.boundary, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))
  ORDER BY ST_Area(d.boundary) ASC   -- prefer the smallest containing polygon (blocks before districts)
  LIMIT 1
)
WHERE id = :challenge_id;
```

A separate block-level attribution uses the same pattern against the `blocks` table. The block backfill may run as a deferred background job to avoid slowing the submission endpoint.

### 5.3 Distance query ("nearby challenges")

"Show me challenges within N km of this point":

```sql
SELECT c.id, c.title,
       ST_Distance(
         c.location::geography,
         ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
       ) AS distance_meters
FROM challenges c
WHERE c.location IS NOT NULL
  AND c.deleted_at IS NULL
  AND ST_DWithin(
    c.location::geography,
    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
    :radius_meters
  )
ORDER BY distance_meters ASC
LIMIT 50;
```

`::geography` casts the geometry to WGS84 geography so `ST_DWithin` operates in **meters**, not degrees. Uses the same GiST index.

### 5.4 District-boundary challenges ("what's in this district?")

```sql
SELECT c.id, c.title, c.status, c.priority_score
FROM challenges c
JOIN districts d ON d.code = c.district_code
WHERE d.code = :district_code
  AND c.deleted_at IS NULL
ORDER BY c.priority_score DESC NULLS LAST;
```

This uses the **B-tree index** on `district_code`, not PostGIS — because `district_code` is a plain text column set by point-in-polygon at submission time. PostGIS is not needed for a district-filtered listing when the code is already stored.

---

## 6. Server-side Heatmap & Point-Clustering

The client map renders tiles; the server returns **pre-aggregated data** — this is the heatmap contract (`API_CONTRACTS.md` §15.4).

### 6.1 District heatmap (the primary heatmap layer)

```sql
-- GET /api/v1/analytics/district-heatmap
SELECT
  c.district_code,
  COUNT(*)::int                     AS total,
  COUNT(*) FILTER (WHERE c.priority_score >= 8.5)::int AS critical,
  COUNT(*) FILTER (WHERE c.priority_score >= 7.0 AND c.priority_score < 8.5)::int AS high,
  COUNT(*) FILTER (WHERE c.priority_score >= 5.0 AND c.priority_score < 7.0)::int AS medium,
  COUNT(*) FILTER (WHERE c.priority_score < 5.0 OR c.priority_score IS NULL)::int  AS standard,
  MODE() WITHIN GROUP (ORDER BY c.category)  AS top_category
FROM challenges c
WHERE c.deleted_at IS NULL
GROUP BY c.district_code;
```

The frontend takes this array and renders each district's polygon with a fill intensity proportional to the total count or critical count. No PostGIS geometry is transferred to the client for the heatmap — just `{ districtCode, total, critical, high, medium, standard, topCategory }`.

### 6.2 Block-level heatmap (phase 2, same pattern)

Identical query with `GROUP BY c.block_code`, scoped to one district via `WHERE c.district_code = :code`.

### 6.3 Point clustering for the challenge map layer

For the challenge-pin layer on the map, the server returns a **bounded result set** (max 200 challenges from the bounding-box query, §5.1), sorted by priority score. Client-side clustering (Leaflet.markercluster or equivalent) handles grouping nearby pins at low zoom levels — this is purely a rendering concern and does not need server-side work at the MVP scale (~100 challenges/day).

At higher scale, a server-side clustering option (PostGIS `ST_ClusterWithin` or materialized cluster summary per viewport) can be added as a new endpoint — the GiST index makes this feasible without performance degradation.

---

## 7. Geocoding Provider Interface

### 7.1 The problem

Citizens report a challenge by name ("Government School road, Kanke block, Ranchi") — the system needs to convert that text into coordinates for PostGIS storage and map pinning.

### 7.2 The provider contract

```text
Geocoder (interface)
  geocode(query: string, districtHint?: string) → { lat, lng, confidence, source } | null
  reverseGeocode(lat, lng) → { districtCode, blockCode, displayName } | null
```

The provider is **not called during submission** in the MVP (to avoid network latency and provider dependency). Instead:

1. Citizen selects district/block from dropdown (always works offline);
2. Optional: citizen uploads a GPS-tagged photo; the server extracts EXIF GPS and backfills (zero network cost);
3. Geocoder runs as a **background enrichment job** (`ai.understand` pipeline extension) after submission — improves the location over time without blocking the report.

### 7.3 MVP: offline reverse-geocoding from PostGIS (no external provider)

At MVP, `reverseGeocode` is a **pure PostGIS query**:

```sql
SELECT d.code AS district_code, b.code AS block_code, d.name || ', ' || b.name AS display_name
FROM districts d
LEFT JOIN blocks b ON ST_Contains(b.boundary, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))
WHERE ST_Contains(d.boundary, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))
LIMIT 1;
```

This requires **no external API key**, no network, and is fully accurate within the resolution of the boundary polygons already in the DB.

For forward geocoding (text → coordinates), the MVP uses **Nominatim** (OpenStreetMap) with a rate-limited wrapper, or simply returns `null` and relies on the district/block dropdown for the spatial anchor. A production provider (Google Geocoding, Mapbox, or a NIC-hosted API) can be swapped in behind the same interface — provider registry pattern, same as `AI_ARCHITECTURE.md` §3.2.

---

## 8. Leaflet Frontend Integration Contract

The frontend uses **Leaflet** (OpenStreetMap tiles) for the map layer. The API → map contract is clean and minimal:

### 8.1 What the API returns

| Endpoint | Response | What the map does with it |
| --- | --- | --- |
| `GET /districts` | `[{ code, name, centroid, riskProfile }]` (no boundary geometry) | Renders district labels/markers at centroids |
| `GET /districts/:code` | `{ code, name, boundary: GeoJSON }` | Renders the district polygon overlay on selection |
| `GET /challenges/spatial?west=&south=&east=&north=` | `[{ id, title, category, priorityScore, status, location: {lat, lng} }]` | Renders challenge pins; client-side `markercluster` groups them |
| `GET /analytics/district-heatmap` | `[{ districtCode, total, critical, ... }]` | Renders district polygon fill (intensity by count/critical) |

### 8.2 What the frontend renders (Leaflet-specific)

| Layer | Source | Rendering |
| --- | --- | --- |
| Base tile | OpenStreetMap raster tiles | standard `L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')` |
| District polygons | `GET /districts/:code` GeoJSON, loaded on selection | `L.geoJSON(boundary, { style: districtStyle })` |
| Challenge pins | `GET /challenges/spatial` | `L.circleMarker` with color = severity, radius = priority |
| Heatmap | `GET /analytics/district-heatmap` | Polygon fill opacity/intensity by `critical + high` count |
| Jharkhand bounds | constants from `mapDataService.ts`: `JHARKHAND_BOUNDS`, `JHARKHAND_CENTER` | `map.fitBounds(JHARKHAND_BOUNDS)` |

The frontend **never computes spatial queries itself** — all points, polygons, and aggregations come from the API. The only client-side spatial logic is `markercluster` grouping, which is a pure rendering concern with no data implications.

### 8.3 The `getSeverityColor` contract

The severity color mapping in `mapDataService.ts` (CRITICAL → red, HIGH → amber, MEDIUM → yellow, STANDARD → green) is the frontend's **own rendering constant** — not coming from the API. The API returns `priorityScore` (0–10 scale) and `riskLevel` (CRITICAL/HIGH/MEDIUM/STANDARD from the AI prioritize engine); the frontend maps these to colors using its existing palette. This keeps the color scheme a UI concern, not a data contract.

---

## 9. Geographic Scope: The 24 Jharkhand Districts

Nivaaran is scoped to **Jharkhand State** for the core lifecycle. The 24 districts are:

```text
Ranchi, Dhanbad, East Singhbhum, West Singhbhum, Bokaro, Giridih,
Hazaribagh, Koderma, Chatra, Latehar, Palamu, Garhwa,
Saraikela Kharsawan, Simdega, Gumla, Khunti, Dumka, Jamtara,
Deoghar, Godda, Sahibganj, Pakur, Lohardaga
```

**Scope rules:**

| Rule | Enforcement |
| --- | --- |
| A challenge's `district_code` must be one of the 24 valid Jharkhand district codes | validated at submission by the API (Zod enum check against the `districts` table) |
| A government officer's geo scope must be a subset of the 24 districts | enforced in `UserGeoScope` (§`DATABASE_DESIGN` §8.4); super admin may be statewide |
| Boundary polygons exist only for these 24 districts + their blocks | seeded by `seed:demo` or imported in production |
| A challenge submitted outside Jharkhand is rejected | validated in the submission flow — no spatial match = no valid district code |

---

## 10. The GIS → Workflow Interaction

GIS is not just visualization — it participates in the workflow lifecycle:

| Lifecycle moment | GIS role |
| --- | --- |
| Challenge submission | point-in-polygon attributes `district_code`/`block_code` from GPS pin; missing GPS uses dropdown |
| AI understand (post-submit) | AI vision backfills GPS from EXIF if `location IS NULL`; reverse-geocodes blocks |
| Dedup/clustering | PostGIS spatial proximity (`ST_DWithin`) is one of the similarity signals for clustering (alongside trigram + tags — `DATABASE_DESIGN.md` §9.1 `pg_trgm`) |
| Prioritization | `spatialRecurrence` factor in the priority engine reads historical GIS cluster density per district/block |
| Matching | university proximity score uses `ST_Distance` between challenge location and university centroid |
| Pilot/Deployment | pilot location and deployment district are recorded for GIS-grounded impact tracking |
| Impact measurement | impact records carry `district_code`; GIS validates spatial consistency of before/after metrics |
| Regional analytics | dashboard heatmaps aggregate challenges per district/block for government decision-makers |

---

## 11. Migration Path (demo → production)

| Aspect | MVP (demo/hackathon) | Production |
| --- | --- | --- |
| Boundary data | simplified GeoJSON from `mapDataService.ts`, seeded by `seed:demo` | SoI/NIC official shapefiles, imported via the same script |
| Geocoding | offline PostGIS reverse-geocode only (no external API) | PostGIS + production geocoder (Google/NIC) behind the same provider interface |
| Challenge scale | ~100/day; GiST index handles effortlessly | ~10k/day; still within PostGIS capability at the GiST index level; scale consideration only if >1M challenges, at which point consider materialized spatial views |
| Point clustering | client-side `markercluster` (Leaflet plugin) | server-side `ST_ClusterWithin` if pin count exceeds client rendering budget |
| Block boundaries | optional; district-level suffices for MVP | full block-level shapefiles (required for PRI/ULB geographic scope enforcement) |

---

## 12. Cross-References

| Concern | Where it lives |
| --- | --- |
| PostGIS schema (columns, GiST indexes, district/block models) | `DATABASE_DESIGN.md` §10 |
| `ST_*` queries in application code | `$queryRaw` calls in the GIS boundary module |
| District/block boundary seed data | `seed:demo` (demo), production import script (prod) |
| GIS endpoints (list, detail, spatial query, heatmap) | `API_CONTRACTS.md` §15 |
| Geocoding provider interface (config-swappable) | `AI_ARCHITECTURE.md` §3.2 (provider registry pattern) |
| `pg_trgm` + GiST trigram index for text dedup | `DATABASE_DESIGN.md` §9.1 |
| Spatial recurrence factor in prioritization | `AI_ARCHITECTURE.md` §4.2 (`spatialRecurrence` in `PriorityFactors`) |
| University proximity score in HEI matching | `AI_ARCHITECTURE.md` §4.3 |
| Frontend Leaflet constants (`JHARKHAND_BOUNDS`, `CENTROIDS`) | `frontend/src/services/mapDataService.ts` |
| Geographic scope enforcement in RBAC | `RBAC_MATRIX.md` §5.2 (`geoScopes` resolver) |
| Security of spatial queries (parameterized `$queryRaw`) | `SECURITY_ARCHITECTURE.md` §9.4 |

---

## 13. Delivery Checklist

- [ ] PostGIS extension created via raw migration; `SELECT postgis_version()` in CI smoke test
- [ ] GiST indexes on `challenges.location`, `districts.boundary`, `blocks.boundary` created
- [ ] 24-district boundary GeoJSON seeded by `seed:demo`; centroids populated for all districts
- [ ] `GET /districts`, `GET /districts/:code`, `GET /challenges/spatial`, `GET /analytics/district-heatmap` endpoints functional with `$queryRaw`
- [ ] Point-in-polygon district/block attribution at submission (or background job)
- [ ] Geocoder provider interface implemented (offline PostGIS reverse-geocode for MVP)
- [ ] EXIF GPS backfill pipeline functional (from evidence uploads)
- [ ] Spatial recurrence factor in prioritization engine queries the GIS data
- [ ] HEI proximity score in match engine uses `ST_Distance`
- [ ] Leaflet map renders district polygons, challenge pins, and heatmap from API data
- [ ] Production boundary import script tested with SoI/NIC sample data
- [ ] Status table in `BACKEND_ARCHITECTURE.md` §26 updated to mark this document complete