# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a hypnosis content generation application built with Next.js 15, React 19, and TypeScript. The application generates dynamic and personalized hypnosis sessions through structured phases, themes, and adaptive content delivery. The project serves as the web frontend for a sophisticated hypnosis content system that incorporates text, images, audio, and binaural beats.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture Overview

### Frontend (Next.js Web App)
- **Location**: `/app` directory using App Router
- **Current State**: Basic Next.js template (needs implementation)
- **Planned Features**: 
  - Randomized flashing words over images
  - Binaural beats and audio playback
  - Real-time content updates via WebSockets/API
  - Visual hypnosis content rendering

### Content System Architecture
The application is built around a sophisticated content generation system with two core subsystems:

#### Cyclers ("What and When" Engine)
Control content selection and sequencing from item pools:
- **RandomCycler**: Unpredictable sequences for overload induction
- **ChainCycler**: Fixed order repetition for pattern reinforcement  
- **WeaveCycler**: Interlaces two content sets for thematic interplay
- **BridgeCycler**: Smooth transitions between themes/states
- **AdaptiveCycler**: Dynamic selection based on session progression
- **Advanced**: SemiRandomCycler, ClusterCycler, RecursiveCycler

#### Players ("How and Where" Engine)  
Control spatial arrangement, timing, and layering:
- **DirectPlayer**: Clean, straightforward presentation
- **StereoSplitPlayer**: Left/right channel alternation
- **RotationalPlayer**: Multi-position spatial cycling
- **LayeredPlayer**: Concurrent element overlap
- **Advanced**: CompositePlayer, TriChamberPlayer

### Content Structure
- **Themes**: High-level hypnosis motifs (stored in `/hypnosis/mantras/` and `/ontologies/`)
- **Sessions**: Configurations with themes, preferences, difficulty, duration
- **Phases**: Structured segments (induction → deepener → suggestion → awakening)
- **State Tracking**: Arousal, focus, and depth monitoring for adaptive content

### Legacy Python System
- **Location**: `/legacy/python-implementation/` directory contains the original Python implementation
- **Components**: Database models, cyclers, players, filters, theme pools
- **Status**: Reference implementation being migrated to Next.js

## File Organization

- `/app/` - Next.js application (layout, pages, components)
- `/hypnosis/` - Content files (mantras, modular scripts)
  - `/mantras/` - Organized by category (Behavior, Ds, Experience, etc.)
  - `/modular/` - Reusable script components
- `/ontologies/` - JSON theme definitions and relationships
- `/docs/` - Architecture, session examples, technical specifications
- `/research/` - Experimental notebooks and development utilities
  - `/notebooks/` - Jupyter notebooks for data conversion and experimentation
  - `/tools/` - Python scripts for content generation (ontology generator, etc.)
- `/assets/` - Static resources for the application
  - `/shaders/` - WebGL fragment shaders for hypnotic visual effects
  - `/images/` - Hypnotic imagery and visual resources
- `/legacy/` - Reference implementation and archived code
  - `/python-implementation/` - Core Python architecture (cyclers, players, database models)

## Key Development Considerations

### Content Integration
- The web app needs to integrate with the hypnosis content system
- Text templates use placeholders: `{subject}`, `{sub_pov}`, `{dominant}`, `{dom_pov}`, `{theme}`, `{difficulty}`
- JSON ontology files define theme relationships and properties
- Audio integration planned with AWS Polly for text-to-speech

### State Management
- Track user arousal, focus, and depth throughout sessions
- Implement adaptive content selection based on real-time state
- Support for multiple simultaneous themes with individual difficulty progression

### Performance Requirements
- Real-time content rendering for hypnotic effects
- Smooth transitions between content phases
- Support for binaural beats and layered audio

### Technology Stack
- Next.js 15 with App Router and Turbopack
- React 19 with TypeScript
- Tailwind CSS for styling
- ESLint for code quality

## Development Resources

### Research and Experimentation
- Data conversion notebooks for migrating content between formats
- Audio pipeline experimentation and testing tools  
- Visual effect prototyping (shaders, heightmaps)
- AI-powered content generation utilities

### Legacy Reference Implementation
- Complete Python implementation of cyclers and players architecture
- Database models and content loading systems
- Text processing and template utilities
- Reference for Next.js migration efforts

### Static Assets
- WebGL fragment shaders for hypnotic visual effects
- Hypnotic imagery and visual resources
- CSS/JS from original web interface

## Implementation Status
- ✅ Project structure and documentation
- ✅ Content files and ontologies
- ✅ Legacy Python reference implementation
- ❌ Next.js frontend implementation (currently default template)
- ❌ API integration layer
- ❌ Content rendering system
- ❌ Session management
- ❌ Audio/visual presentation layer