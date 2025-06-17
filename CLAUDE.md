# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

AI Conditioner Web is a Next.js 15 TypeScript application for generating personalized hypnosis content. The system creates adaptive sessions through themes, mantras, and sophisticated content delivery mechanisms called Cyclers and Players.

## Essential Commands

### Development
- **Start development server**: `npm run dev` (uses Turbopack for fast builds)
- **Build production**: `npm run build`
- **Start production**: `npm start`
- **Lint code**: `npm run lint`

### Database Operations
- **Generate Prisma client**: `npx prisma generate`
- **Database migrations**: `npx prisma migrate dev`
- **Database studio**: `npx prisma studio`
- **Database push (dev)**: `npx prisma db push`

### Testing (when implemented)
- **Run all tests**: `npm test`
- **Run single test**: `npm test -- <test-file>`
- **E2E tests**: `npm run test:e2e`

## Core Architecture

### Session Engine (`lib/session-engine/`)
The heart of the application implementing a sophisticated content delivery system:

**Cyclers** (`cyclers/`): Content selection and sequencing logic
- `base.ts` - Abstract cycler interface
- `adaptive.ts` - Dynamic content adaptation based on user state
- `weave.ts` - Interlaces two content sets for thematic interplay
- `cluster.ts` - Groups content in thematic clusters

**Players** (`players/`): Spatial arrangement and delivery mechanisms  
- `base.ts` - Abstract player interface
- `direct.ts` - Straightforward content delivery
- `tri-chamber.ts` - Three-channel spatial audio distribution
- `rotational.ts` - Rotating spatial positions for disorientation

**Session State Tracking**: The system tracks user arousal, focus, and depth to adapt content dynamically. This drives the AdaptiveCycler's decisions about content intensity and selection.

### Template Processing (`lib/tts/`)
Advanced template system supporting:
- **Variable substitution**: `{subject_subjective}`, `{dominant_name}`, etc.
- **Verb conjugation**: `[am|are|are|is]` patterns based on POV
- **AWS Polly integration**: Hash-based audio caching and generation
- **159 verb patterns**: Comprehensive conjugation support in `verb-conjugations.ts`

### Database Schema (`prisma/schema.prisma`)
Multi-model architecture supporting:
- **Users**: Authentication, preferences, POV settings, scoring
- **Themes**: High-level hypnosis motifs with tags and metadata
- **Mantras**: Template-based content with difficulty progression
- **Sessions**: User-created session configurations with phases
- **Telemetry**: Real-time state tracking (arousal/focus/depth)

## Key File Locations (Check These First!)

> **IMPORTANT**: Always search these locations before assuming files don't exist or need to be created from scratch.

### Core Application Structure

**Next.js App Router** (`app/`):
- `app/page.tsx` - Homepage/landing page
- `app/layout.tsx` - Root layout with global providers
- `app/globals.css` - Global styles and Tailwind imports
- `app/auth/signin/page.tsx` & `app/auth/signup/page.tsx` - Authentication pages
- `app/dashboard/page.tsx` - User dashboard
- `app/session/builder/page.tsx` - Session creation interface  
- `app/session/player/[id]/page.tsx` - Session playback interface
- `app/admin/mantra-editor/page.tsx` - Administrative mantra editing
- **API Routes**:
  - `app/api/auth/[...nextauth]/route.ts` - NextAuth.js authentication
  - `app/api/auth/register/route.ts` - User registration
  - `app/api/themes/route.ts` - Theme management API
  - `app/api/tts/generate/route.ts` - Text-to-speech generation

**React Components** (`components/`):
- `components/auth/` - Authentication components (login-form, signup-form, user-nav)
- `components/layout/header.tsx` - Main application header
- `components/providers/auth-provider.tsx` - Authentication context
- `components/ui/spiral-viewer.tsx` - WebGL-based visual effects component

### Core Business Logic (`lib/`)

**Session Engine** (`lib/session-engine/`):
- **Cyclers**: `adaptive.ts`, `weave.ts`, `cluster.ts`, `base.ts` - Content selection logic
- **Players**: `direct.ts`, `tri-chamber.ts`, `rotational.ts`, `base.ts` - Spatial delivery mechanisms
- `director.ts` - Session orchestration logic
- `session-parser.ts` - Configuration parsing
- `types.ts` - TypeScript definitions for session engine

**Content Processing**:
- `lib/mantras/generation-logic.ts` - Mantra generation algorithms
- `lib/mantras/template-renderer.ts` - Template processing engine
- `lib/tts/aws-polly.ts` - AWS Polly TTS integration
- `lib/tts/verb-conjugations.ts` - 159 verb conjugation patterns
- `lib/themes.ts` - Theme management utilities
- `lib/auth.ts` - Authentication configuration
- `lib/db.ts` - Database connection utilities

### Content and Data

**Hypnosis Content** (`hypnosis/`):
- `hypnosis/mantras/` - Structured content by category:
  - `Ds/` - Dominance/submission (Gaslighting.json, Obedience.json)
  - `Experience/` - Experiential content (Dreaming.json)
  - `Hypnosis/` - Core techniques (Acceptance.json, Brainwashing.json, Mindbreak.json, etc.)
  - `Identity/` - Identity transformation (Bimbo.json, Doll.json, Slave.json)
  - `Personality/` - Personality modification (Addiction.json, Feminine.json)
- `hypnosis/modular/` - Modular session components:
  - Root: Thematic modules (Aliens.txt, Compliance.txt, Drone.txt, etc.)
  - `deepener/` - Trance deepening techniques
  - `induction/` - Hypnotic induction methods  
  - `suggestion/` - Specific suggestion patterns
  - `wakener/` - Session ending techniques

**Theme Definitions** (`ontologies/`):
- 150+ JSON files defining psychological themes and metadata
- Examples: `Bimbo.json`, `Relaxation.json`, `Obedience.json`, `Mindbreak.json`
- Each contains theme metadata, difficulty progression, psychological markers

### Static Assets

**WebGL Shaders**:
- `assets/shaders/` - Source shader files for development
- `public/shaders/` - Production shaders (pink_spiral.frag, reversing_rainbow.frag, etc.)
- `assets/shaders/notes.md` - Shader development documentation

**Images**:
- `assets/images/` - Source images (spiral.jpg, yukari.png)
- `public/images/` - Production images

### Documentation (`docs/`)

**Architecture Documentation**:
- `docs/ARCHITECTURE.md` - System architecture overview
- `docs/ARCHITECTURAL_ANALYSIS.md` - Detailed architectural analysis
- `docs/cyclers_and_players_overview.md` - Core system explanations
- `docs/web_app_development_plan.md` - Development roadmap
- `docs/MVP_Plan.md` - MVP specifications

**Content Documentation**:
- `docs/Ontology.md` - Theme system documentation  
- `docs/Session_Grammar.md` - Session configuration syntax
- `docs/Terms.md` - Project terminology
- `docs/Themes.md` - Theme system overview

**AI Prompts** (`docs/prompts/`):
- Various .txt files for content generation prompts
- Mantra generation templates and instructions

### Database and Configuration

**Database**:
- `prisma/schema.prisma` - Complete database schema definition
- `prisma/dev.db` - SQLite development database

**Configuration Files**:
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint rules

### Legacy and Development

**Legacy Python Implementation** (`legacy/`):
- `legacy/python-implementation/src/` - Original cyclers, players, core modules
- `legacy/python-implementation/database/` - Original data models
- Reference implementation for TypeScript migration

**Development Tools**:
- `scripts/` - TypeScript migration and maintenance scripts
- `research/notebooks/` - Jupyter notebooks for experimentation
- `research/tools/` - Python content generation tools

## Key Patterns

### Session Creation Flow
1. User selects themes in session builder (`app/session/builder/`)
2. System applies difficulty progression and filters
3. Session engine combines Cyclers + Players for content delivery
4. Real-time state tracking adapts content during playback

### Template Processing Pipeline
1. Load theme-specific mantras with difficulty filters
2. Apply POV and gender variable substitution
3. Process verb conjugations based on grammatical context
4. Generate TTS audio with hash-based caching
5. Deliver through spatial audio players

### Component Architecture
- **App Router**: Next.js 15 app directory structure
- **Server Components**: API routes in `app/api/`
- **Client Components**: Interactive UI with state management
- **Prisma ORM**: Type-safe database operations
- **NextAuth**: Authentication with multiple providers

## Development Notes

### Theme System
Themes are high-level hypnosis motifs that combine with user preferences to generate personalized content. Each theme has associated mantras, difficulty levels, and psychological metadata stored in both file-based content (`hypnosis/mantras/`) and database records.

### State Management
The application uses a combination of:
- **Zustand**: Client-side state management
- **React Query**: Server state and caching
- **Prisma**: Database state with type safety
- **Session state**: Real-time tracking of user hypnotic state

### Audio Processing
TTS generation follows a specific workflow:
1. Template text → Variable substitution → Verb conjugation
2. Generate SHA256 hash of final text for deduplication
3. AWS Polly synthesis with voice selection
4. File storage with hash-based naming convention

### Visual Effects
WebGL-based spiral viewer (`components/ui/spiral-viewer.tsx`) supports multiple shader programs for immersive visual experiences. Shaders are loaded dynamically from `public/shaders/` directory.

## Integration Points

### Discord Bot API
The application provides unified APIs for the companion Discord bot to pull session metadata and mantra content, eliminating content duplication between platforms.

### CDN Strategy  
Audio files are designed to migrate from local storage to external CDN (Cloudflare R2/AWS S3) for scalability and global distribution.

### Production Infrastructure
- **Deployment**: Vercel with Next.js optimization
- **CDN**: Cloudflare for static assets and DDoS protection
- **Database**: PostgreSQL (development uses SQLite)
- **Monitoring**: Planned integration with analytics and error tracking

## Repository Etiquette

### Commit Messages
Must follow Conventional Commits format: `type(scope): subject`

**Examples**: 
- `feat(auth): add password reset endpoint`
- `fix(ui): correct button alignment` 
- `docs(readme): update setup instructions`

**Allowed types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `security`, `env`, `deps`

### Branch Naming
Prefer the following patterns:
- `feature/descriptive-name`
- `fix/issue-number-description` 
- `docs/area-updated`

### Merging
Prefer squash and merge for feature branches into the main development branch.

### General Workflow
- **Test-Driven Approach**: For new features or bug fixes, aim to write or update tests first
- **Documentation with Code**: When adding/modifying API endpoints or significant features, update relevant JSDoc and/or markdown documentation in the same commit
- **Pre-commit Hooks**: Hooks for linting, formatting, and type-checking run automatically. Ensure they pass before finalizing a commit

## GitHub CLI (gh) Usage

### Issue Management

- **Issue Creation**: Use `gh issue create --title "Issue Title" --body "Description" --label "bug,feature-auth,priority-high"` to create GitHub issues
- **View Issues**: Use `gh issue list` to see open issues, `gh issue view <number>` for details
- **Pull Request Management**: Use `gh pr create`, `gh pr list`, `gh pr view <number>` for PR operations
- **Repository Info**: Use `gh repo view` to see repository information
- **Authentication**: Ensure `gh auth status` shows you're authenticated before using gh commands

### Label Usage Guidelines

**Required Labels for New Issues:**

- **One Issue Type**: `bug`, `enhancement`, `documentation`, `refactor`, `security`, `performance`, `tech-debt`, `maintenance`, `migration`
- **One Priority**: `priority-critical`, `priority-high`, `priority-medium`, `priority-low`, `priority-backlog`
- **One or More Features**: Use `feature-*` labels for specific features or `component-*` for cross-cutting concerns

**Feature Labels** (for specific feature areas):

- `feature-session-engine` - Cyclers, Players, and core session logic
- `feature-tts` - Text-to-speech and audio processing
- `feature-themes` - Theme system and ontologies
- `feature-mantras` - Mantra templates and content processing
- `feature-auth` - Authentication and user management
- `feature-database` - Database schema and operations
- `feature-api` - API endpoints and integration
- `feature-ui` - User interface components
- `feature-shaders` - WebGL visual effects
- `feature-discord` - Discord bot integration
- `feature-cdn` - Audio storage and CDN
- `feature-session-builder` - Session creation interface
- `feature-session-player` - Session playback interface

**Component Labels** (for cross-cutting concerns):

- `component-testing` - Testing infrastructure and quality assurance
- `component-deployment` - DevOps and deployment
- `component-admin` - Administrative tools

**Optional Labels:**

- **Effort Estimation**: `effort-xs` (<2h), `effort-s` (2-8h), `effort-m` (1-3d), `effort-l` (3-7d), `effort-xl` (1+ weeks)
- **Research Needs**: `deepsearch-requested` (for heavy analysis requiring specialized AI), `needs-design`, `needs-research`
- **Release Priority**: `mvp` (critical for MVP release)

### GitHub Issue Creation Tips

When creating GitHub issues with complex markdown content, use the Write tool to create a temporary file:

1. **Use the Write tool to create the issue body file:**

   ```typescript
   // Use Write tool to create issue-body.md with your content
   Write(
     'issue-body.md',
     `
   ## Problem Description
   
   Your markdown content here...
   
   ## Recommendations
   - Bullet points
   - Code blocks
   `
   );
   ```

2. **Use the temp file in the gh command, then clean up:**

   ```bash
   gh issue create --title "Issue Title" --body-file issue-body.md --label "enhancement,priority-high" && rm issue-body.md
   ```

3. **Alternative: For simple issues, use direct --body flag:**
   ```bash
   # For shorter, simpler content without complex formatting
   gh issue create --title "Title" --body "Simple description" --label "bug,priority-high"
   ```

**Important Notes:**

- **NEVER use heredocs (`cat > file << 'EOF'`)** - they have delimiter issues in the Claude Code environment
- **ALWAYS use the Write tool** for creating temporary files with complex content
- **ALWAYS chain `&& rm filename.md`** to clean up after successful issue creation
- The Write tool handles all escaping and formatting correctly

**Label Examples:**

```bash
# Bug report
gh issue create --title "Session player audio fails to load" --label "bug,feature-session-player,priority-high,effort-s"

# Feature request
gh issue create --title "Add new spiral shader effects" --label "enhancement,feature-shaders,priority-medium,effort-l"

# Research task requiring deep analysis
gh issue create --title "Optimize mantra template processing performance" --label "performance,feature-mantras,priority-medium,deepsearch-requested,effort-m"

# Security improvement
gh issue create --title "Implement rate limiting for TTS API endpoints" --label "security,feature-tts,feature-api,priority-high,effort-m"

# Cross-feature enhancement
gh issue create --title "Improve session builder UX for theme selection" --label "enhancement,feature-session-builder,feature-ui,priority-medium,effort-l"

# MVP critical item
gh issue create --title "Fix authentication flow for production deployment" --label "bug,feature-auth,priority-critical,mvp,effort-s"
```

**Special Labels:**

- **`deepsearch-requested`**: Use when issue requires heavy research, complex analysis, or architectural decisions
- **`needs-design`**: Use when issue requires architectural planning before implementation
- **`needs-research`**: Use when issue requires investigation or proof-of-concept work
- **`mvp`**: Critical for minimum viable product release

## Development Best Practices

### Code Organization

**Keep Related Changes Together:**
- Session engine changes (cyclers, players) should include any necessary type updates
- TTS modifications should update both generation logic and any related UI components
- Theme/mantra changes should include both content files and database schema updates if needed

**Commit Hygiene:**
- Use descriptive commit messages following conventional commits format
- Include context about *why* changes were made, not just what changed
- Break large features into logical, reviewable commits

### Development Environment Notes

- **Database**: Run `npx prisma generate` after schema changes, `npx prisma db push` for dev database updates
- **Audio Files**: TTS output stored locally in development (will migrate to CDN for production)
- **Content Loading**: Hypnosis content in `hypnosis/` and `ontologies/` directories loaded at build time
- **Shaders**: WebGL fragment shaders in `public/shaders/` are loaded dynamically by the spiral viewer

### Common Gotchas

- **Search Commands**: Use `--exclude-dir=node_modules --exclude-dir=.next --exclude-dir=legacy` to avoid timeouts
- **Template Variables**: TTS templates use `{variable}` syntax - ensure proper escaping in JSON content
- **Audio Caching**: TTS files are hash-based - content changes regenerate audio automatically
- **Prisma Schema**: Always run `npx prisma generate` after schema modifications before starting dev server