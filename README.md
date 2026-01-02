# eCFR Data Reader

A comprehensive data analysis tool for the Electronic Code of Federal Regulations (eCFR). Download, analyze, and visualize federal regulations data with an intuitive dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tests](https://img.shields.io/badge/tests-41%20passing-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- 📥 **Data Download Scripts** - Automated downloading from eCFR API with retry logic
- 📊 **Word Count Analysis** - Detailed analysis by hierarchy level (title, chapter, section)
- 🏛️ **Agency Statistics** - 153 federal agencies with CFR title references
- 🎨 **Interactive Dashboard** - Beautiful UI built with Tailwind CSS
- 🔍 **7 REST API Endpoints** - Access data programmatically
- ✅ **41 Unit Tests** - Comprehensive test coverage with Vitest
- 📝 **TypeScript Strict Mode** - Full type safety throughout

## Quick Start

```bash
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

Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to see the analysis dashboard.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── dashboard/         # Dashboard UI
├── lib/                   # Shared libraries
│   ├── ecfr/             # eCFR types & constants
│   ├── analysis/         # Analysis engines
│   └── fixtures/         # Data loading
├── scripts/              # Data download scripts
├── fixtures/             # Downloaded data storage
├── tests/                # Test files
└── docs/                 # Documentation
```

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Architecture](./docs/ARCHITECTURE.md)** - System design and technical decisions
- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup, workflow, and common tasks
- **[Prototyping Guide](./docs/PROTOTYPING.md)** - Guidelines for building new features
- **[Future Enhancements](./docs/FUTURE.md)** - Roadmap and enhancement ideas
- **[API Reference](./docs/API_service.md)** - eCFR API endpoints

## Key Technologies

- **[Next.js 16](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first styling
- **[Vitest](https://vitest.dev)** - Fast unit testing
- **[pnpm](https://pnpm.io)** - Efficient package management

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Testing
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once
pnpm test:ui          # Open test UI

# Data Download
pnpm tsx scripts/download-agencies.ts              # Download agencies
pnpm tsx scripts/download-titles-summary.ts        # Download all titles
pnpm tsx scripts/download-title.ts [number]        # Download specific title
pnpm tsx scripts/download-title.ts 17 --date 2025-12-30  # With date
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/agencies` | List all federal agencies |
| `GET /api/titles` | List all CFR titles |
| `GET /api/titles/[title]` | Get specific title structure |
| `GET /api/analysis/word-count?title=N` | Word count analysis |
| `GET /api/analysis/agency-stats` | Agency statistics |

## Dashboard Features

### Overview Stats
- Total agencies: 153
- Total CFR titles: 50
- Agencies with references: 315
- Average titles per agency: 1.4

### Title 17 Analysis
- 4,118 structural elements
- Word count by hierarchy type
- Top 10 longest elements

### Agency Statistics
- Top 10 agencies by title count
- Title distribution visualization
- Agency-title relationship mapping

## Development Approach

This project was built using a "work backwards" methodology:

1. **Backend Scripts** - Download and store data as fixtures
2. **Testing** - Write unit tests for reliability
3. **API Layer** - Create endpoints to serve data
4. **Analysis** - Build analysis engines
5. **UI** - Develop dashboard to visualize results

This approach ensures solid foundations and makes the system easy to extend.

## Data Source

All data is sourced from the official [Electronic Code of Federal Regulations (eCFR)](https://www.ecfr.gov) API provided by the U.S. Government Publishing Office.

## Architecture Highlights

### File-Based Storage
Currently uses file system for data storage (fixtures). Simple and sufficient for prototyping with easy migration path to database when needed.

### Server Components
Leverages React Server Components for:
- Better performance (less client-side JavaScript)
- Direct access to file system
- SEO benefits
- Simpler data flow

### Type Safety
Strict TypeScript throughout with:
- Interfaces matching API responses
- Type guards for safe navigation
- No `any` types
- Full IDE autocomplete

## Testing

41 unit tests covering:
- Download scripts with mocked API calls
- Analysis engines with sample data
- Fixture loaders with real files
- Utility functions (retry logic, file operations)

```bash
pnpm test:run
# Test Files  4 passed (4)
#      Tests  41 passed (41)
```

## Future Enhancements

See [docs/FUTURE.md](./docs/FUTURE.md) for detailed roadmap. Key priorities:

- [ ] Content parsing improvements for accurate word counts
- [ ] Database migration (SQLite → PostgreSQL)
- [ ] Full-text search functionality
- [ ] Comparison features (compare titles)
- [ ] Historical tracking (changes over time)
- [ ] Export to CSV/PDF
- [ ] Automated data refresh

## Contributing

1. Read [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)
2. Check [docs/PROTOTYPING.md](./docs/PROTOTYPING.md) before adding features
3. Write tests for new code
4. Follow existing patterns
5. Submit pull requests

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Data from [eCFR.gov](https://www.ecfr.gov) - U.S. Government Publishing Office
- Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
- Developed with AI assistance from Claude Code

---

**Questions?** Check the [documentation](./docs/README.md) or open an issue.
