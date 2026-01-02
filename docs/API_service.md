## eCFR API v1 Endpoints

### Admin Service
- **`/api/admin/v1/agencies.json`** - Get all top-level agencies with children and CFR references
- **`/api/admin/v1/corrections.json`** - Get all eCFR corrections (filterable by date, title, error_corrected_date)
- **`/api/admin/v1/corrections/title/{title}.json`** - Get corrections for a specific title

### Search Service
- **`/api/search/v1/results`** - Search CFR by query with extensive filtering (agency_slugs, date, last_modified_*, pagination)
- **`/api/search/v1/count`** - Get count of search results
- **`/api/search/v1/summary`** - Get search summary details
- **`/api/search/v1/counts/daily`** - Get search result counts grouped by date
- **`/api/search/v1/counts/titles`** - Get search result counts grouped by title
- **`/api/search/v1/counts/hierarchy`** - Get search result counts grouped by regulatory hierarchy
- **`/api/search/v1/suggestions`** - Get search suggestions

### Versioner Service
- **`/api/versioner/v1/titles.json`** - Get summary info for all CFR titles (amendment dates, issue dates, status)
- **`/api/versioner/v1/ancestry/{date}/title-{title}.json`** - Get full regulatory hierarchy/ancestry for a title at a specific point in time
- **`/api/versioner/v1/full/{date}/title-{title}.xml`** - Get source XML for a title or subset (returns XML document)
- **`/api/versioner/v1/structure/{date}/title-{title}.json`** - Get complete structure of a title as JSON (hierarchy without content)
- **`/api/versioner/v1/versions/title-{title}.json`** - Get all sections/appendices in a title with amendment history

All endpoints support point-in-time queries via date parameters, allowing you to retrieve regulations as they existed on specific dates.