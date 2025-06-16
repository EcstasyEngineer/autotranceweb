# 🚀 Complete Content System Migration to Database Templates

## Overview
Migrate the entire AI Conditioner content system from file-based storage to database-backed templates. This eliminates content duplication, enables cross-theme tagging, and centralizes all theme/mantra data in the database.

## Current State
- **Ontologies**: 100+ JSON files with theme metadata in `ontologies/`
- **Mantras**: 13 large JSON files (~200KB each) with duplicated first/third person content in `hypnosis/mantras/`
- **Database**: Partially implemented schema but no content

## Target State
- **All theme metadata** in `Theme` table
- **All mantra content** as templates in `Mantra` table with cross-theme relationships
- **Runtime rendering** from templates to user-specific text
- **File cleanup** - archive old content files

## Prerequisites (DevOps)

### 1. Database Setup
- [ ] **PostgreSQL server** accessible from development environment
- [ ] **DATABASE_URL** environment variable configured
- [ ] **Prisma connection** tested (`npx prisma db push`)
- [ ] **Backup strategy** for migration rollback

### 2. Environment Setup
- [ ] **Node.js dependencies** installed (`npm install`)
- [ ] **TypeScript execution** (`npm install -g tsx` or use `npx`)
- [ ] **Prisma CLI** available (`npx prisma --version`)

### 3. Schema Migration
- [ ] **Run Prisma migration** to create new schema:
  ```bash
  npx prisma migrate dev --name mantra_template_system
  ```

## Migration Steps

### Phase 1: Content Analysis & Preparation
- [ ] **Review migration script** at `scripts/full-content-migration.ts`
- [ ] **Check content inventory**:
  ```bash
  # Count ontology files
  ls ontologies/*.json | wc -l
  
  # Find large mantra JSON files
  find hypnosis/mantras -name "*.json" -size +50k -exec ls -lah {} \;
  ```
- [ ] **Verify cross-theme relationships** in script are accurate

### Phase 2: Execute Migration
- [ ] **Run migration script**:
  ```bash
  tsx scripts/full-content-migration.ts
  ```
- [ ] **Review generated SQL** at `prisma/migrations/complete_content_migration.sql`
- [ ] **Execute SQL migration**:
  ```bash
  psql $DATABASE_URL -f prisma/migrations/complete_content_migration.sql
  ```

### Phase 3: Verification
- [ ] **Verify theme count**:
  ```sql
  SELECT COUNT(*) as theme_count FROM "Theme";
  SELECT categories, COUNT(*) FROM "Theme" GROUP BY categories;
  ```
- [ ] **Verify mantra count**:
  ```sql
  SELECT COUNT(*) as mantra_count FROM "Mantra";
  SELECT difficulty, COUNT(*) FROM "Mantra" GROUP BY difficulty;
  SELECT "hasDominant", COUNT(*) FROM "Mantra" GROUP BY "hasDominant";
  ```
- [ ] **Test template rendering**:
  ```typescript
  import { TemplateRenderer } from './lib/mantras/template-renderer';
  // Test with sample template and user context
  ```

### Phase 4: Integration Testing
- [ ] **Test session engine** with new database content
- [ ] **Test mantra generation** through API endpoints
- [ ] **Verify cross-theme discovery** works correctly
- [ ] **Test audio generation** pipeline with templates

### Phase 5: File Cleanup
- [ ] **Archive original files**:
  ```bash
  mkdir -p legacy/content-migration-$(date +%Y%m%d)
  mv ontologies/ legacy/content-migration-$(date +%Y%m%d)/
  mv hypnosis/mantras/ legacy/content-migration-$(date +%Y%m%d)/
  ```
- [ ] **Update .gitignore** if needed
- [ ] **Remove obsolete import paths** from codebase

## Expected Results

### Database Population
- **~100 themes** in Theme table with enhanced metadata
- **~3000+ mantras** in Mantra table as templates (estimated from 13 large JSON files)
- **Cross-theme relationships** properly tagged
- **Storage reduction** of ~60% by eliminating duplicates

### Functionality Improvements
- **Dynamic POV rendering** from templates
- **Cross-theme content discovery** during sessions
- **Centralized content management** 
- **Efficient audio caching** with hash-based naming

## Rollback Plan

If migration fails:
1. **Restore database** from backup
2. **Restore archived files** to original locations
3. **Revert Prisma schema** changes
4. **Document issues** for retry

## File Changes Made

### New Files
- `scripts/full-content-migration.ts` - Complete migration logic
- `lib/mantras/template-renderer.ts` - Runtime template processor
- `Docs/MANTRA_SYSTEM_REFACTOR.md` - System documentation
- `Docs/DESCRIPTION_ANOMALIES.md` - Content comparison analysis

### Modified Files
- `prisma/schema.prisma` - Enhanced Theme/Mantra models + RenderedMantra
- Various import paths (update after migration)

## Testing Checklist

- [ ] **Basic CRUD operations** on themes and mantras
- [ ] **Template rendering** with various POV combinations
- [ ] **Cross-theme queries** return related content
- [ ] **Session building** uses database content
- [ ] **Audio generation** works with templates
- [ ] **Performance** is acceptable with database queries

## Monitoring

After migration, monitor:
- **Database performance** with new content volume
- **Template rendering speed** 
- **Audio generation cache hit rate**
- **Cross-theme discovery effectiveness**

## Success Criteria

✅ **All themes migrated** with enhanced metadata  
✅ **All mantras templated** without first/third person duplication  
✅ **Cross-theme relationships** functional  
✅ **Runtime rendering** produces correct text for all POV combinations  
✅ **Session engine integration** working  
✅ **Performance acceptable** for production use  

---

**Estimated Time**: 4-6 hours (including testing and verification)  
**Risk Level**: Medium (database migration with extensive content)  
**Dependencies**: PostgreSQL access, Prisma setup