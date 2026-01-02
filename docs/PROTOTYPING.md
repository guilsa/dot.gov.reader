# Prototyping Guidelines & Questions

## Critical Questions Before Starting Any New Feature

### 1. Data & Storage
- [ ] **Where does the data come from?** (Live API, fixtures, user input, computed?)
- [ ] **How much data are we talking about?** (KB, MB, GB?)
- [ ] **How often does the data change?** (Static, daily, real-time?)
- [ ] **Can we prototype with fixtures first?** (Work backwards approach)
- [ ] **Do we need to store this data?** (Or compute on-demand?)
- [ ] **Will this data fit in our current file-based storage?** (Or need database?)

### 2. Performance & Scale
- [ ] **How many users will use this feature?** (1, 10, 1000, 10k+?)
- [ ] **What's the acceptable response time?** (<100ms, <1s, <5s?)
- [ ] **Can this be cached?** (Static, 1 hour, 1 day, never?)
- [ ] **Does this need to be real-time?** (Or can it be batch processed?)
- [ ] **Will this block the UI?** (Should it be async/background?)
- [ ] **What happens with 10x more data?** (Will it still work?)

### 3. User Experience
- [ ] **Who is this feature for?** (Developers, analysts, general public?)
- [ ] **What problem does this solve?** (What pain point?)
- [ ] **How will users discover this feature?** (Navigation, search, obvious?)
- [ ] **What's the happy path?** (Ideal user flow)
- [ ] **What can go wrong?** (Error cases, edge cases)
- [ ] **How do we show progress?** (Loading states, feedback)
- [ ] **Is this feature intuitive?** (Or needs documentation/tooltips?)

### 4. Technical Implementation
- [ ] **Can we reuse existing code?** (DRY - Don't Repeat Yourself)
- [ ] **Where does this fit in our architecture?** (Which layer?)
- [ ] **Does this need a new API endpoint?** (Or extend existing?)
- [ ] **Should this be a Server or Client Component?** (Default to Server)
- [ ] **What are the dependencies?** (New npm packages needed?)
- [ ] **How will we test this?** (Unit, integration, manual?)
- [ ] **What's the simplest version?** (MVP vs full feature)

### 5. Maintenance & Future
- [ ] **How will this age?** (Maintenance burden in 6 months?)
- [ ] **Is this a one-off or reusable?** (Component library candidate?)
- [ ] **How do we monitor this?** (Errors, performance, usage)
- [ ] **What's the migration path?** (If we outgrow current approach)
- [ ] **Does this lock us into decisions?** (Or easy to change later?)
- [ ] **What documentation is needed?** (Code comments, user docs, API docs)

## Feature Development Checklist

### Phase 1: Research & Planning
- [ ] Review existing code for similar patterns
- [ ] Check if eCFR API supports what we need
- [ ] Prototype with minimal code (spike/POC)
- [ ] Write design doc or update this file
- [ ] Get feedback before building

### Phase 2: Implementation
- [ ] Create types first (TypeScript definitions)
- [ ] Build backend/data layer (if needed)
- [ ] Write tests (TDD or test-after)
- [ ] Build API route (if needed)
- [ ] Create UI component
- [ ] Manual testing in browser

### Phase 3: Polish & Documentation
- [ ] Add error handling
- [ ] Add loading states
- [ ] Improve error messages
- [ ] Write or update documentation
- [ ] Update README if user-facing

### Phase 4: Review & Ship
- [ ] Run all tests (`pnpm test:run`)
- [ ] Test in different browsers/devices
- [ ] Code review (or self-review)
- [ ] Commit with good message
- [ ] Deploy and monitor

## Common Prototyping Patterns

### Pattern 1: New Data Source
**When:** Adding data from a new API or source

**Steps:**
1. Create types in `/lib/ecfr/types.ts`
2. Add fetch function in `/scripts/utils/ecfr-client.ts`
3. Create download script in `/scripts/`
4. Test download manually
5. Create fixture loader function
6. Add API route (if exposing to UI)
7. Create UI component

**Example:** Adding corrections data
```typescript
// 1. Type
export interface Correction {
  title: number;
  date: string;
  description: string;
}

// 2. Fetch
export async function fetchCorrections() {
  const res = await fetch(`${ECFR_BASE_URL}/api/admin/v1/corrections.json`);
  return await res.json();
}

// 3. Script
async function downloadCorrections() {
  const corrections = await fetchCorrections();
  await writeJSON(getFixturePath('corrections', 'corrections.json'), corrections);
}

// 4. Loader
export async function loadCorrections(): Promise<Correction[]> {
  const path = getFixturePath('corrections', 'corrections.json');
  return await readJSON<Correction[]>(path);
}

// 5. API route
export async function GET() {
  const corrections = await loadCorrections();
  return NextResponse.json(corrections);
}
```

### Pattern 2: New Analysis Type
**When:** Adding a new way to analyze existing data

**Steps:**
1. Create analysis types in `/lib/analysis/types.ts`
2. Write analysis function in `/lib/analysis/`
3. Write unit tests with sample data
4. Add API route that uses analysis function
5. Create UI component to display results

**Example:** Complexity score
```typescript
// 1. Type
export interface ComplexityResult {
  title: number;
  complexityScore: number; // 0-100
  factors: {
    avgSectionLength: number;
    nestedDepth: number;
    technicalTermDensity: number;
  };
}

// 2. Analysis
export function analyzeComplexity(structure: TitleStructure): ComplexityResult {
  // ... analysis logic
}

// 3. Test
describe('analyzeComplexity', () => {
  it('should calculate complexity score', () => {
    const result = analyzeComplexity(mockStructure);
    expect(result.complexityScore).toBeGreaterThan(0);
  });
});

// 4. API route
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const structure = await loadTitleStructure(Number(title));
  const analysis = analyzeComplexity(structure);
  return NextResponse.json(analysis);
}
```

### Pattern 3: New UI Component
**When:** Adding a new visualization or interaction

**Steps:**
1. Decide: Server Component or Client Component?
2. Define props interface
3. Build component with Tailwind
4. Add to dashboard page
5. Test responsiveness (mobile, tablet, desktop)

**Example:** Timeline chart
```typescript
// Server Component (no interactivity)
interface TimelineChartProps {
  events: Array<{ date: string; title: string }>;
}

export function TimelineChart({ events }: TimelineChartProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Timeline</h3>
      <div className="space-y-2">
        {events.map((event, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{event.date}</span>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm font-medium">{event.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Pattern 4: Background Job / Script
**When:** Long-running operation that doesn't need immediate feedback

**Steps:**
1. Create script in `/scripts/`
2. Add npm script to `package.json`
3. Test manually
4. Document in README
5. Consider scheduling (cron, GitHub Actions)

**Example:** Daily data refresh
```json
// package.json
{
  "scripts": {
    "refresh-data": "tsx scripts/refresh-all-data.ts"
  }
}
```

```yaml
# .github/workflows/refresh-data.yml
name: Refresh eCFR Data
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
  workflow_dispatch:

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm refresh-data
      - run: git commit -am "Update eCFR data"
      - run: git push
```

## Decision Trees

### Should I add a new npm package?

```
Is there a native solution? (Node.js API, browser API)
├─ Yes → Use native solution
└─ No → Is the package well-maintained?
    ├─ No → Look for alternative or build yourself
    └─ Yes → Is the package small (<50KB)?
        ├─ Yes → Safe to add
        └─ No → Do I need all features?
            ├─ No → Find smaller alternative
            └─ Yes → Is this used in multiple places?
                ├─ No → Inline the functionality
                └─ Yes → Add the package
```

### Should I use a database?

```
How much data?
├─ < 10 titles → File-based is fine
└─ > 10 titles → Need complex queries?
    ├─ No → File-based might still work with indexing
    └─ Yes → Need real-time updates?
        ├─ No → SQLite (simple, single file)
        └─ Yes → PostgreSQL (production-ready)
```

### Should this be cached?

```
Does the data change?
├─ Never → Cache forever (static generation)
└─ Sometimes → How often?
    ├─ Daily → Cache 1 hour
    ├─ Hourly → Cache 5 minutes
    └─ Real-time → Don't cache (or cache 30s)
```

## Prototyping Tips

### Speed vs Quality Trade-offs

**For Prototypes (learning/validation):**
- ✅ Hardcode values
- ✅ Skip error handling
- ✅ Single test case
- ✅ Inline styles
- ✅ Console logs for debugging

**For Production Features:**
- ✅ Configurable parameters
- ✅ Comprehensive error handling
- ✅ Full test coverage
- ✅ Reusable components
- ✅ Proper logging/monitoring

### When to Refactor vs Rebuild

**Refactor when:**
- Core logic is sound
- Just needs cleanup/optimization
- Tests exist
- Used in production

**Rebuild when:**
- Architecture is wrong
- Too much technical debt
- Requirements changed significantly
- Simpler to start fresh

### Red Flags to Watch For

🚩 **"I'll just copy-paste this code"** → Create a shared utility instead
🚩 **"This will only be used once"** → It never is, make it reusable
🚩 **"I'll add error handling later"** → It will break in production
🚩 **"I don't need types for this"** → Future you will regret this
🚩 **"Tests are too hard to write"** → Code is probably too complex
🚩 **"Let me add this package for one function"** → Check if you can inline it

## Example: Prototyping a New Feature

### Feature: Compare Two Titles

**Phase 1: Questions**
- Data: Need structures for both titles (already have via fixtures)
- Scale: 2 titles at a time, on-demand computation
- UX: Side-by-side comparison table
- Implementation: Server component, reuse existing loaders
- Test: Unit test for comparison logic

**Phase 2: Spike (30 min)**
```typescript
// Quick prototype in lib/analysis/compare.ts
export function compareTitles(t1: TitleStructure, t2: TitleStructure) {
  return {
    title1: { number: t1.title, wordCount: analyzeWordCount(t1).totalWords },
    title2: { number: t2.title, wordCount: analyzeWordCount(t2).totalWords },
    difference: Math.abs(/* ... */),
  };
}
```

**Phase 3: Validate**
- Manual test with Title 17 vs another
- Check if insight is useful
- Decide: build it or drop it?

**Phase 4: Build (if validated)**
- Add proper types
- Write tests
- Create API route
- Build UI component
- Documentation

## Questions to Ask When Code Review (or Self-Review)

### Functionality
- Does it work as expected?
- Are edge cases handled?
- What happens with invalid input?

### Code Quality
- Is it readable? (Can someone else understand it?)
- Is it maintainable? (Easy to change later?)
- Are there any obvious bugs?
- Is error handling sufficient?

### Performance
- Are there any obvious inefficiencies?
- Does it need optimization? (Or premature?)
- How does it scale with more data?

### Testing
- Is it tested? (Unit, integration, manual?)
- Are tests meaningful? (Not just coverage)
- Do tests cover edge cases?

### Documentation
- Is it documented? (Comments, README, types?)
- Is the documentation accurate?
- Would a new developer understand this?

## Resources

### Internal Documentation
- `/docs/ARCHITECTURE.md` - System design decisions
- `/docs/API_service.md` - eCFR API reference
- `/docs/DEVELOPMENT.md` - Development workflow (to be created)

### External References
- [Next.js Docs](https://nextjs.org/docs) - Framework reference
- [eCFR API](https://www.ecfr.gov/developers) - Official API docs
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling reference
- [Vitest](https://vitest.dev/) - Testing framework

## Template: Feature Proposal

```markdown
## Feature: [Name]

### Problem
What problem does this solve?

### Solution
High-level approach

### Questions Checklist
- [ ] Data source: [where]
- [ ] Data size: [estimate]
- [ ] Performance: [requirements]
- [ ] User flow: [describe]
- [ ] Testing: [strategy]

### Implementation Plan
1. Step one
2. Step two
3. ...

### Risks & Mitigation
- Risk: [what could go wrong]
  Mitigation: [how to handle]

### Success Criteria
- [ ] Metric/goal 1
- [ ] Metric/goal 2
```
