# Migration Scripts

This directory contains scripts for migrating the mantra system to the new template-based format.

## Overview

The migration involves several steps to transform from the old tab-separated format with duplicate Bambi/first-person versions to a streamlined template system with cross-theme tagging.

## Migration Steps

### 1. Merge Theme Metadata
```bash
tsx scripts/merge-theme-metadata.ts
```

This script:
- Combines ontology JSON files with enhanced theme metadata
- Maps old tags to new category system
- Adds related theme relationships
- Outputs unified theme definitions to `content/themes/`
- Generates SQL migration for theme data

### 2. Convert Mantras to Templates
```bash
tsx scripts/migrate-mantras-to-templates.ts
```

This script:
- Reads existing `.txt` files from `hypnosis/mantras/`
- Converts first-person and third-person versions to template format
- Removes redundancy by storing single templated version
- Detects cross-theme references automatically
- Outputs converted mantras to `content/mantras/`
- Generates SQL migration for mantra data

### 3. Database Migration
```bash
# Generate and run Prisma migration
npx prisma migrate dev --name mantra_template_system

# Execute the generated SQL files
psql $DATABASE_URL -f prisma/migrations/theme_metadata.sql
psql $DATABASE_URL -f prisma/migrations/mantra_templates.sql
```

## File Structure Changes

### Before
```
ontologies/
  ├── Acceptance.json      # Theme metadata only
  └── ...
hypnosis/mantras/
  ├── Category/
  │   ├── Theme.txt       # Tab-separated with Bambi columns
  │   └── Theme.json      # Duplicate first/third person
  └── ...
```

### After
```
content/
  ├── themes/
  │   ├── acceptance.json  # Complete theme definition
  │   └── ...
  └── mantras/
      ├── acceptance.json  # Template format mantras
      └── ...
```

## Template Format

### Old Format (Tab-separated)
```
BASIC	I accept new ideas with an open heart.	Bambi accepts new ideas with an open heart.	NoDom
```

### New Format (Template)
```json
{
  "template": "{subject_subjective} [accept|accepts] new ideas with an open heart.",
  "difficulty": "BASIC",
  "hasDominant": false,
  "crossThemes": ["Openness", "Suggestibility"]
}
```

## Runtime Rendering

The `lib/mantras/template-renderer.ts` utility handles converting templates to actual text based on user preferences:

```typescript
const renderer = new TemplateRenderer();
const context = {
  subjectPOV: 'FIRST_PERSON',
  subjectName: 'Alice',
  dominantPOV: 'THIRD_PERSON',
  dominantName: 'Master',
  // ... other settings
};

const result = renderer.render(
  "{subject_subjective} [trust|trusts] {dominant_name}'s guidance.",
  context
);
// Output: "I trust Master's guidance."
```

## Benefits

1. **Storage Efficiency**: ~60% reduction by eliminating duplicate versions
2. **Flexibility**: Support any POV/name combination without pre-generation
3. **Cross-theme Discovery**: Rich tagging enables content mixing
4. **Caching**: Hash-based deduplication prevents duplicate TTS generation
5. **Maintainability**: Single source of truth for each mantra

## Troubleshooting

### Missing Dependencies
If you get TypeScript errors, ensure you have tsx installed:
```bash
npm install -g tsx
```

### Database Errors
Make sure your DATABASE_URL is set and the database is accessible:
```bash
npx prisma db push  # Test connection
```

### Cross-theme Detection
The automatic cross-theme detection uses keyword matching. Review and adjust the results manually if needed.

## Next Steps

After migration:
1. Test the template rendering with various user configurations
2. Update the mantra generation prompts (see `Docs/Prompts/Mantra_Prompt_V3_Template.txt`)
3. Implement the new rendering system in the session engine
4. Consider migrating existing audio files to the new hash-based naming system