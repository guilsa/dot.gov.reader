# Architecture Documentation

## System Overview

The eCFR Data Reader is a Next.js application that downloads, stores, and analyzes Code of Federal Regulations data. Built using a "work backwards" approach: backend → fixtures → tests → APIs → UI.

## Design Principles

### 1. File-Based Storage (Current)
**Decision:** Use file system for data storage instead of a database.

**Rationale:**
- Simplicity: No database setup, migrations, or ORM complexity
- Portability: Easy to version control, share, and inspect data
- Sufficient Performance: Sample data analysis works well with file I/O
- Easy Migration Path: Can switch to database later without changing API contracts

**Trade-offs:**
- Limited query capabilities (no SQL)
- Not suitable for real-time updates
- Doesn't scale to hundreds of titles efficiently

**When to migrate:** If you need >10 titles or real-time data updates

### 2. TypeScript Everywhere
**Decision:** Strict TypeScript for all code.

**Rationale:**
- Type safety catches errors at compile time
- Better IDE support and autocomplete
- Self-documenting code through type definitions
- Safe refactoring

**Pattern:** Define types in `/lib/ecfr/types.ts` that match API responses exactly

### 3. Server Components by Default
**Decision:** Use React Server Components for data loading.

**Rationale:**
- Better performance (less JavaScript to client)
- SEO benefits (fully rendered HTML)
- Direct access to file system and utilities
- Simpler data flow (no useEffect/useState for fetching)

**When to use Client Components:**
- Interactive features (sorting, filtering)
- Client-side state management
- Browser APIs (localStorage, etc.)

### 4. Separation of Concerns

```
scripts/          → Data acquisition (CLI tools)
lib/fixtures/     → Data layer (loading fixtures)
lib/analysis/     → Business logic (pure functions)
app/api/          → API layer (HTTP endpoints)
app/dashboard/    → Presentation layer (UI components)
```

**Key Insight:** Each layer has a clear responsibility and can be tested independently.

## Data Flow

```
eCFR API
   ↓
Download Scripts (scripts/*.ts)
   ↓
Fixtures (fixtures/*.json)
   ↓
Fixture Loader (lib/fixtures/loader.ts)
   ↓
Analysis Engine (lib/analysis/*.ts)
   ↓
API Routes (app/api/*)
   ↓
Dashboard UI (app/dashboard/*)
```

## Key Architectural Decisions

### Idempotent Scripts
All download scripts check for existing data before downloading. Safe to re-run.

**Why:** Prevents unnecessary API calls, supports iterative development, reliable in CI/CD.

### Retry with Exponential Backoff
All external API calls use retry logic (3 attempts, exponential delay).

**Why:** Network failures are common, eCFR API has rate limits, improves reliability.

### Fixture Metadata Tracking
Every download creates metadata files with timestamps and status.

**Why:** Know when data was last updated, debug failures, track partial downloads.

### Type Guards for Structural Nodes
Helper functions like `isSection()`, `isPart()` for type narrowing.

**Why:** Safe navigation of recursive tree structures, better TypeScript support.

## Testing Strategy

### Levels of Testing

1. **Unit Tests** (fast, isolated)
   - Pure functions (analysis logic)
   - Utilities (retry, file operations)
   - Use mocked dependencies

2. **Integration Tests** (slower, broader)
   - API routes with fixture data
   - Fixture loader with real files
   - No live API calls

3. **No E2E Tests** (yet)
   - Would require running dev server
   - Future consideration for UI workflows

### Test Fixtures
Separate small fixtures in `/tests/fixtures/` for fast tests. Real fixtures in `/fixtures/` are too large for unit tests.

## Performance Considerations

### Current Bottlenecks
1. **Title 17 XML File:** 172MB - slow to load/parse
2. **Fixture Loading:** Synchronous file reads on each request
3. **Analysis Computation:** Runs on every page load

### Optimization Strategies (Future)
1. Add caching layer (Redis, in-memory)
2. Pre-compute analysis results
3. Implement lazy loading for large datasets
4. Stream large XML files instead of loading entirely

## Security Considerations

### Current State
- Read-only fixture access
- No user authentication
- No data persistence from users
- CORS not configured (same-origin only)

### Future Needs
- If adding user features: authentication, authorization
- If exposing API publicly: rate limiting, CORS
- If accepting file uploads: validation, sandboxing
- Environment variables: use `.env.local` (gitignored)

## Scalability Path

### Current Limits
- File-based storage: ~10-20 titles max
- Analysis on-demand: acceptable for demo/prototype
- Single server deployment

### Migration Strategy to Production

1. **Phase 1: Optimize Current System**
   - Add Redis caching
   - Pre-compute analysis
   - CDN for static assets

2. **Phase 2: Add Database**
   - PostgreSQL for metadata
   - Keep fixtures for raw data
   - Hybrid approach

3. **Phase 3: Full Database Migration**
   - Import all fixtures to database
   - Archive fixtures as backups
   - Use database for all queries

4. **Phase 4: Horizontal Scaling**
   - Separate API server and dashboard
   - Background jobs for data updates
   - Load balancing

## Error Handling Philosophy

### Downloads
- Retry on transient failures
- Continue on partial success
- Log everything for debugging
- Update metadata with errors

### API Routes
- Return meaningful error messages
- Include suggestions (e.g., "run download script")
- 400 for client errors, 500 for server errors
- Never expose stack traces to users

### UI
- Graceful degradation (show what's available)
- Loading states for async operations
- Error boundaries for React errors
- User-friendly error messages

## Dependencies Philosophy

### Minimal Dependencies
Currently using:
- Next.js (framework)
- React (UI)
- Tailwind (styling)
- Vitest (testing)
- TypeScript (language)

**Why minimal:** Reduces maintenance burden, faster installs, smaller bundles, less security risk.

**When to add dependencies:**
- Clear benefit > maintenance cost
- Well-maintained library (active development)
- No easy alternative with existing tools
- Used in multiple places

## Future Architecture Considerations

### Database Schema (if migrating)

```sql
-- Agencies table
CREATE TABLE agencies (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  parent_id INTEGER REFERENCES agencies(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Titles table
CREATE TABLE titles (
  id SERIAL PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  reserved BOOLEAN DEFAULT FALSE,
  latest_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agency-Title References (many-to-many)
CREATE TABLE agency_title_refs (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER REFERENCES agencies(id),
  title_id INTEGER REFERENCES titles(id),
  chapter TEXT,
  part TEXT,
  UNIQUE(agency_id, title_id, chapter, part)
);

-- Structure nodes (recursive)
CREATE TABLE structure_nodes (
  id SERIAL PRIMARY KEY,
  title_id INTEGER REFERENCES titles(id),
  parent_id INTEGER REFERENCES structure_nodes(id),
  type TEXT NOT NULL, -- 'chapter', 'section', etc.
  identifier TEXT NOT NULL,
  label TEXT,
  content TEXT,
  word_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_structure_title ON structure_nodes(title_id);
CREATE INDEX idx_structure_parent ON structure_nodes(parent_id);
CREATE INDEX idx_structure_type ON structure_nodes(type);
```

### API Versioning (if public)
- `/api/v1/agencies` (current)
- `/api/v2/agencies` (future breaking changes)
- Version in URL for clarity
- Deprecation notices in headers

### GraphQL Consideration
**Pros:** Flexible queries, less over-fetching, strong typing
**Cons:** More complexity, requires GraphQL knowledge, caching harder
**Recommendation:** Stick with REST until you have >20 endpoints or complex query needs

## Monitoring & Observability

### Current State
- Console logs only
- No metrics collection
- No error tracking

### Future Additions (Priority Order)
1. **Error Tracking:** Sentry or similar (catch production errors)
2. **Logging:** Structured logs (JSON format, levels)
3. **Metrics:** Response times, error rates, cache hit rates
4. **Tracing:** Request flow across services
5. **Alerts:** Automated notifications for failures

## Technology Decisions Summary

| Decision | Choice | Alternative Considered | Why Chosen |
|----------|--------|----------------------|------------|
| Framework | Next.js 16 | Remix, vanilla React | Best React framework, server components, great DX |
| Storage | File system | PostgreSQL, MongoDB | Simplicity for prototype, easy migration |
| Testing | Vitest | Jest | Faster, better ESM support, modern |
| Styling | Tailwind CSS | CSS Modules, styled-components | Utility-first, fast development |
| Language | TypeScript | JavaScript | Type safety, better tooling |
| API Pattern | REST | GraphQL, tRPC | Simple, well-understood, no extra deps |

## Lessons Learned

### What Worked Well
- Starting with backend/fixtures enabled fast iteration
- File-based storage simplified initial development
- Strong typing caught many bugs early
- Server Components reduced complexity

### What to Improve
- Word count analysis needs content parsing improvements
- Fixture size management (Title 17 is huge)
- Better error messages for missing fixtures
- Add loading indicators for slow operations

### What to Avoid
- Don't commit large fixture files to git (use `.gitignore`)
- Don't fetch from live API in tests (use mocks)
- Don't over-engineer before validating features
- Don't skip error handling in scripts
