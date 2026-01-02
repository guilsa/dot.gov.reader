# eCFR Data Reader Documentation

Welcome to the eCFR Data Reader documentation! This guide will help you understand, use, and extend the system.

## Quick Links

- **[Architecture Documentation](./ARCHITECTURE.md)** - System design, decisions, and patterns
- **[Development Guide](./DEVELOPMENT.md)** - Setup, workflow, and common tasks
- **[Prototyping Guide](./PROTOTYPING.md)** - Questions and guidelines for new features
- **[Future Enhancements](./FUTURE.md)** - Roadmap and enhancement ideas
- **[API Reference](./API_service.md)** - eCFR API endpoints documentation

## What is eCFR Data Reader?

An open-source tool for downloading, storing, and analyzing data from the Electronic Code of Federal Regulations (eCFR). Built with Next.js, TypeScript, and Tailwind CSS.

### Key Features

✅ **Data Download Scripts** - Fetch agencies, titles, and regulatory structure
✅ **File-Based Storage** - Simple fixtures system with metadata tracking
✅ **Analysis Engine** - Word count and agency statistics
✅ **REST API** - 7 endpoints for data access
✅ **Interactive Dashboard** - Visualize regulatory data
✅ **41 Unit Tests** - Comprehensive test coverage
✅ **TypeScript Strict Mode** - Full type safety

## Getting Started

### For Users

```bash
# 1. Install dependencies
pnpm install

# 2. Download data
pnpm tsx scripts/download-agencies.ts
pnpm tsx scripts/download-titles-summary.ts
pnpm tsx scripts/download-title.ts 17

# 3. Start application
pnpm dev

# 4. Visit dashboard
open http://localhost:3000/dashboard
```

### For Developers

1. Read the [Development Guide](./DEVELOPMENT.md)
2. Check [Architecture Documentation](./ARCHITECTURE.md)
3. Review existing code patterns
4. Write tests first (TDD)
5. Follow the commit convention

### For AI Agents & Future Development

Start with the [Prototyping Guide](./PROTOTYPING.md) for important questions to consider before building new features.

## Documentation Structure

```
docs/
├── README.md           # This file - documentation index
├── ARCHITECTURE.md     # System design and decisions
├── DEVELOPMENT.md      # Development workflow and guides
├── PROTOTYPING.md      # Questions for building features
├── FUTURE.md           # Enhancement ideas and roadmap
└── API_service.md      # eCFR API reference
```

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────┐
│                  eCFR API (ecfr.gov)                │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              Download Scripts (CLI)                  │
│  • download-agencies.ts                             │
│  • download-titles-summary.ts                       │
│  • download-title.ts                                │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│           Fixtures (File System Storage)            │
│  • agencies/agencies.json                           │
│  • titles/summary.json                              │
│  • titles/title-17/structure.json                   │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│          Fixture Loader (Data Access Layer)         │
│  • loadAgencies()                                   │
│  • loadTitleStructure()                             │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│         Analysis Engine (Business Logic)            │
│  • analyzeWordCount()                               │
│  • analyzeAgencyStats()                             │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│              API Routes (HTTP Layer)                │
│  • GET /api/agencies                                │
│  • GET /api/titles/[title]                          │
│  • GET /api/analysis/word-count                     │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│         Dashboard UI (Presentation Layer)           │
│  • Stats cards                                      │
│  • Data tables                                      │
│  • Charts and visualizations                        │
└─────────────────────────────────────────────────────┘
```

## Core Principles

### 1. Work Backwards
Start with data and fixtures, then build APIs and UI on top.

### 2. Type Safety
TypeScript strict mode everywhere. Types match API responses exactly.

### 3. Separation of Concerns
Each layer has a single responsibility:
- Scripts: Download data
- Fixtures: Store data
- Loaders: Read data
- Analysis: Transform data
- APIs: Expose data
- UI: Display data

### 4. Simplicity First
File-based storage is simple and sufficient for prototyping. Can migrate to database when needed.

### 5. Test Everything
41 unit tests covering utilities, analysis, and data loading. Integration tests for API routes.

## Data Flow Example

Let's trace how word count analysis works:

```typescript
// 1. User visits dashboard
GET http://localhost:3000/dashboard

// 2. Server Component loads data
const structure = await loadTitleStructure(17);
//   ↓ Reads from fixtures/titles/title-17/structure-*.json

// 3. Analysis engine processes data
const analysis = analyzeWordCount(structure);
//   ↓ Recursively walks tree, counts words

// 4. Component renders results
<WordCountTable hierarchyData={analysis.byHierarchy} />
//   ↓ Displays in formatted table

// 5. Browser shows dashboard
```

## Common Tasks

### Download New Title
```bash
pnpm tsx scripts/download-title.ts 10  # Energy
pnpm tsx scripts/download-title.ts 40  # Environmental Protection
```

### Run Tests
```bash
pnpm test           # Watch mode
pnpm test:run       # Run once
pnpm test:ui        # UI mode
```

### Add New Analysis
See [Prototyping Guide](./PROTOTYPING.md#pattern-2-new-analysis-type)

### Deploy
See [Development Guide](./DEVELOPMENT.md#build--deploy)

## Tech Stack

| Category | Technology | Why |
|----------|-----------|-----|
| Framework | Next.js 16 | Best React framework, App Router, Server Components |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Fast development, utility-first |
| Testing | Vitest | Fast, modern, great ESM support |
| Data Storage | File System | Simple for prototype, easy migration |
| Deployment | Vercel | Seamless Next.js integration |

## Project Stats

- **Lines of Code:** ~3,500+
- **Files Created:** 43
- **Tests:** 41 passing
- **API Endpoints:** 7
- **Downloaded Data:** 153 agencies, 50 titles, Title 17 complete
- **Test Coverage:** ~60%

## Roadmap

See [FUTURE.md](./FUTURE.md) for detailed enhancement ideas.

### Short Term (Month 1)
- [ ] Fix content parsing for word count
- [ ] Download 5-10 more titles
- [ ] Basic search functionality
- [ ] Improve error messages

### Medium Term (Month 2-3)
- [ ] SQLite database migration
- [ ] Automated data refresh
- [ ] Comparison features
- [ ] Export to CSV/PDF

### Long Term (Month 4+)
- [ ] Historical tracking
- [ ] Advanced analytics
- [ ] Public API
- [ ] Mobile app

## Contributing

This is primarily a learning/prototyping project. If you want to contribute:

1. Fork the repository
2. Create a feature branch
3. Follow existing patterns
4. Write tests
5. Submit pull request

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed guidelines.

## License

[Add your license here]

## Acknowledgments

- Data from [eCFR.gov](https://www.ecfr.gov) - U.S. Government Publishing Office
- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Tested with [Vitest](https://vitest.dev)

## Questions?

- Check the [Prototyping Guide](./PROTOTYPING.md) for feature development questions
- Review [Architecture](./ARCHITECTURE.md) for design decisions
- See [Development Guide](./DEVELOPMENT.md) for setup and workflow
- Explore [Future Enhancements](./FUTURE.md) for ideas

---

**Last Updated:** 2026-01-02
**Version:** 1.0.0
**Status:** Prototype/MVP
