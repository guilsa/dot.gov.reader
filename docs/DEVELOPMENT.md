# Development Guide

## Getting Started

### Prerequisites
- Node.js 20+ (check with `node --version`)
- pnpm (install with `npm install -g pnpm`)
- Git
- Code editor (VS Code recommended)

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd dot.gov.reader

# Install dependencies
pnpm install

# Download sample data
pnpm tsx scripts/download-agencies.ts
pnpm tsx scripts/download-titles-summary.ts
pnpm tsx scripts/download-title.ts 17

# Run tests
pnpm test:run

# Start development server
pnpm dev
```

Visit http://localhost:3000 to see the application.

## Project Structure

```
/Users/gui/dev/dot.gov.reader/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages & components
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── lib/                   # Shared utilities & business logic
│   ├── ecfr/             # eCFR-specific types & constants
│   ├── analysis/         # Analysis engines (word count, stats)
│   └── fixtures/         # Fixture loading utilities
├── scripts/              # Data download scripts
│   ├── download-*.ts     # Download scripts
│   └── utils/            # Script utilities (retry, file ops)
├── fixtures/             # Downloaded data (gitignored if large)
│   ├── agencies/
│   ├── titles/
│   └── metadata.json
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   ├── fixtures/         # Test fixtures (smaller than real data)
│   └── setup.ts          # Global test setup
├── docs/                 # Documentation
└── public/               # Static assets
```

## Development Workflow

### Adding a New Feature

1. **Create a branch** (optional, for collaboration)
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Write or update tests** (TDD approach)
   ```bash
   # Create test file
   touch tests/unit/lib/my-feature.test.ts

   # Run tests in watch mode
   pnpm test
   ```

3. **Implement the feature**
   - Follow existing patterns (see `/docs/PROTOTYPING.md`)
   - Use TypeScript strict mode
   - Add proper error handling

4. **Test manually**
   ```bash
   pnpm dev
   # Visit http://localhost:3000
   ```

5. **Run linter**
   ```bash
   pnpm lint
   ```

6. **Commit changes**
   ```bash
   git add .
   git commit -m "Add feature: description"
   ```

### Working with Data

#### Download New Data
```bash
# Download a specific title
pnpm tsx scripts/download-title.ts [title-number]

# Download with specific date
pnpm tsx scripts/download-title.ts 17 --date 2025-12-30

# Force re-download
pnpm tsx scripts/download-title.ts 17 --force

# Download all agencies
pnpm tsx scripts/download-agencies.ts

# Download titles summary
pnpm tsx scripts/download-titles-summary.ts
```

#### Check Downloaded Data
```bash
# View fixtures
ls -lh fixtures/

# Check metadata
cat fixtures/metadata.json | jq

# Count elements in Title 17
cat fixtures/titles/title-17/structure-*.json | jq '.children | length'
```

### Testing

#### Run All Tests
```bash
pnpm test:run          # Run once
pnpm test              # Watch mode
pnpm test:ui           # UI mode (opens browser)
```

#### Run Specific Tests
```bash
# Run tests for a specific file
pnpm test tests/unit/lib/analysis/word-count.test.ts

# Run tests matching pattern
pnpm test word-count
```

#### Coverage
```bash
pnpm test:run --coverage
# Opens coverage report in ./coverage/index.html
```

### Debugging

#### Debug Tests
```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work', () => {
    const result = myFunction();
    console.log('Debug:', result); // Simple logging
    expect(result).toBe(expected);
  });
});
```

#### Debug API Routes
```bash
# Check dev server logs
pnpm dev

# In another terminal, test endpoint
curl http://localhost:3000/api/agencies | jq

# Check response headers
curl -I http://localhost:3000/api/agencies
```

#### Debug React Components
- Use React DevTools browser extension
- Add `console.log` in Server Components
- Use `debugger` statement in Client Components

### Code Style

#### TypeScript Guidelines
```typescript
// ✅ Good: Explicit types
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hello, ${user.name}`;
}

// ❌ Bad: Implicit any
function greet(user) {
  return `Hello, ${user.name}`;
}

// ✅ Good: Type guards
function isSection(node: StructureNode): node is Section {
  return node.type === 'section';
}

// ❌ Bad: Type assertions everywhere
const section = node as Section;
```

#### Component Guidelines
```typescript
// ✅ Good: Server Component (default)
export default async function Page() {
  const data = await loadData();
  return <div>{data}</div>;
}

// ✅ Good: Client Component (when needed)
'use client';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// ✅ Good: Typed props
interface CardProps {
  title: string;
  description?: string;
}

export function Card({ title, description }: CardProps) {
  return <div>...</div>;
}
```

#### Naming Conventions
- **Files:** kebab-case (`word-count.ts`)
- **Components:** PascalCase (`AgencyStatsTable.tsx`)
- **Functions:** camelCase (`analyzeWordCount`)
- **Constants:** UPPER_SNAKE_CASE (`ECFR_BASE_URL`)
- **Types/Interfaces:** PascalCase (`WordCountResult`)
- **Private variables:** prefix with `_` (rarely needed)

### Common Tasks

#### Add a New Download Script

1. Create script file:
```typescript
// scripts/download-something.ts
import { fetchSomething } from './utils/ecfr-client';
import { writeJSON, updateMetadata, getFixturePath } from './utils/file-system';

async function downloadSomething() {
  console.log('Downloading something...');

  const data = await fetchSomething();
  const path = getFixturePath('something', 'data.json');

  await writeJSON(path, data);
  await updateMetadata({
    type: 'something',
    timestamp: new Date().toISOString(),
    status: 'success',
  });

  console.log('✓ Downloaded successfully');
}

if (require.main === module) {
  downloadSomething();
}

export { downloadSomething };
```

2. Add fetch function to client:
```typescript
// scripts/utils/ecfr-client.ts
export async function fetchSomething(): Promise<Something[]> {
  const response = await retryWithBackoff(async () => {
    const res = await fetch(`${ECFR_BASE_URL}/api/path`);
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    return res;
  });

  return await response.json();
}
```

#### Add a New Analysis Function

1. Define types:
```typescript
// lib/analysis/types.ts
export interface MyAnalysisResult {
  metric1: number;
  metric2: string;
  details: Array<{ name: string; value: number }>;
}
```

2. Implement analysis:
```typescript
// lib/analysis/my-analysis.ts
import type { TitleStructure } from '@/lib/ecfr/types';
import type { MyAnalysisResult } from './types';

export function analyzeMyMetric(structure: TitleStructure): MyAnalysisResult {
  // Implementation
  return {
    metric1: 42,
    metric2: 'result',
    details: [],
  };
}
```

3. Write tests:
```typescript
// tests/unit/lib/analysis/my-analysis.test.ts
import { describe, it, expect } from 'vitest';
import { analyzeMyMetric } from '@/lib/analysis/my-analysis';
import { createMockTitleStructure } from '@/tests/fixtures/factories';

describe('analyzeMyMetric', () => {
  it('should calculate metric correctly', () => {
    const structure = createMockTitleStructure();
    const result = analyzeMyMetric(structure);

    expect(result.metric1).toBeGreaterThan(0);
    expect(result.details).toHaveLength(0);
  });
});
```

4. Add API route:
```typescript
// app/api/analysis/my-metric/route.ts
import { NextResponse } from 'next/server';
import { loadTitleStructure } from '@/lib/fixtures/loader';
import { analyzeMyMetric } from '@/lib/analysis/my-analysis';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');

  if (!title) {
    return NextResponse.json(
      { error: 'Missing title parameter' },
      { status: 400 }
    );
  }

  const structure = await loadTitleStructure(Number(title));
  const analysis = analyzeMyMetric(structure);

  return NextResponse.json(analysis);
}
```

#### Add a New UI Component

1. Create component file:
```typescript
// app/dashboard/_components/MyComponent.tsx
interface MyComponentProps {
  data: MyAnalysisResult;
}

export function MyComponent({ data }: MyComponentProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">My Analysis</h3>
      <div className="text-2xl font-bold">{data.metric1}</div>
      <p className="text-sm text-gray-600">{data.metric2}</p>
    </div>
  );
}
```

2. Add to dashboard:
```typescript
// app/dashboard/page.tsx
import { MyComponent } from './_components/MyComponent';

export default async function DashboardPage() {
  // ... existing code

  const myAnalysis = analyzeMyMetric(titleStructure);

  return (
    <div className="space-y-8">
      {/* ... existing sections */}

      <section>
        <h2 className="text-xl font-semibold mb-4">My Analysis</h2>
        <MyComponent data={myAnalysis} />
      </section>
    </div>
  );
}
```

## Environment Variables

### Current Setup
No environment variables needed for local development.

### Adding Environment Variables

1. Create `.env.local` (gitignored):
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost/db
API_KEY=secret
```

2. Update TypeScript types:
```typescript
// env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string;
      DATABASE_URL: string;
      API_KEY: string;
    }
  }
}

export {};
```

3. Use in code:
```typescript
// Server-side (API routes, Server Components)
const apiKey = process.env.API_KEY;

// Client-side (Client Components)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Build & Deploy

### Local Build
```bash
# Build for production
pnpm build

# Test production build locally
pnpm start
```

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Deploy to Other Platforms

**Netlify:**
```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Docker:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## Troubleshooting

### Common Issues

**Issue: Tests failing after dependency update**
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm test:run
```

**Issue: Port 3000 already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
# Or use different port
PORT=3001 pnpm dev
```

**Issue: TypeScript errors in IDE but builds fine**
```bash
# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or rebuild TypeScript
pnpm exec tsc --noEmit
```

**Issue: Fixture not found errors**
```bash
# Check if fixture exists
ls fixtures/titles/title-17/

# Re-download if missing
pnpm tsx scripts/download-title.ts 17

# Check metadata
cat fixtures/metadata.json | jq '.downloads'
```

## Performance Tips

### Development Server
```bash
# Use turbopack for faster builds (Next.js 13+)
pnpm dev --turbo

# Skip type checking during dev (faster)
# Set in next.config.ts:
typescript: {
  ignoreBuildErrors: true, // Only for dev!
}
```

### Large Fixtures
```bash
# Don't commit large fixtures
# Add to .gitignore:
fixtures/titles/*/full-*.xml
fixtures/titles/*/structure-*.json

# Download on deployment instead
# Or store in external storage (S3, etc.)
```

## Git Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation changes

### Commit Messages
```bash
# Good commit messages
git commit -m "Add word frequency analysis for titles"
git commit -m "Fix: Handle missing fixtures gracefully"
git commit -m "Refactor: Extract common table component"
git commit -m "Docs: Update development guide"

# Bad commit messages (avoid)
git commit -m "fixed bug"
git commit -m "updates"
git commit -m "wip"
```

### Pre-commit Checklist
- [ ] Tests pass (`pnpm test:run`)
- [ ] No TypeScript errors (`pnpm exec tsc --noEmit`)
- [ ] Linter passes (`pnpm lint`)
- [ ] Code is formatted
- [ ] No console.logs (unless intentional)
- [ ] Documentation updated (if needed)

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [VS Code Extensions](https://marketplace.visualstudio.com/):
  - ESLint
  - Tailwind CSS IntelliSense
  - Prettier
  - GitLens

### Learning Resources
- [Next.js Learn](https://nextjs.org/learn) - Interactive tutorial
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Getting Help

### Where to Look First
1. This documentation (`/docs/`)
2. Code comments in similar features
3. Test files (show usage examples)
4. Next.js documentation
5. eCFR API documentation

### Debugging Checklist
- [ ] Check console for errors
- [ ] Check network tab for API errors
- [ ] Check test output
- [ ] Check TypeScript errors
- [ ] Read error messages carefully
- [ ] Search error message online
- [ ] Check if fixture data exists
- [ ] Verify environment variables

### Question Template
When asking for help, provide:
1. What you're trying to do
2. What you expected to happen
3. What actually happened
4. Error messages (full text)
5. Code snippet (minimal reproducible example)
6. Environment (OS, Node version, etc.)
