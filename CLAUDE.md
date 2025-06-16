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

### Content Organization
- **`hypnosis/mantras/`**: Categorized mantra content (Behavior, Experience, Identity, etc.)
- **`ontologies/`**: JSON theme definitions with metadata
- **`public/shaders/`**: WebGL fragment shaders for visual effects
- **`Docs/`**: Comprehensive documentation including architecture and session examples

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